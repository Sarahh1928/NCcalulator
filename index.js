const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3003;
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Serve static files in the 'public' folder
app.use(express.static('public'));

function createPdfFromImages(imagesDir, outputPdfPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ autoFirstPage: false });
        fs.readdir(imagesDir, (err, files) => {
            if (err) return reject('Error reading images directory');
            
            const imageFiles = files.filter(file => /\.(png|jpg|jpeg)$/i.test(file)).sort();
            const writeStream = fs.createWriteStream(outputPdfPath);
            doc.pipe(writeStream);

            imageFiles.forEach((file, index) => {
                const imagePath = path.join(imagesDir, file);
                if (index === 0) doc.addPage();
                const img = doc.openImage(imagePath);
                const scaleFactor = Math.min(doc.page.width / img.width, doc.page.height / img.height);
                const imgWidth = img.width * scaleFactor;
                const imgHeight = img.height * scaleFactor;
                const x = (doc.page.width - imgWidth) / 2;
                const y = (doc.page.height - imgHeight) / 2;
                doc.addPage().image(imagePath, x, y, { width: imgWidth, height: imgHeight });
            });

            doc.end();
            writeStream.on('finish', () => resolve('PDF created successfully'));
            writeStream.on('error', (err) => reject('Error creating PDF'));
        });
    });
}

app.post('/save-image', (req, res) => {
    const { image, filename } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const filePath = path.join(__dirname, 'public/images', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) return res.status(500).send('Error deleting existing image');
                saveNewImage(filePath, base64Data, res);
            });
        } else {
            saveNewImage(filePath, base64Data, res);
        }
    });
});

function saveNewImage(filePath, base64Data, res) {
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) return res.status(500).send('Error saving image');
        res.status(200).send('Image saved successfully');
    });
}

app.listen(port, () => console.log(`Server is running on port ${port}`));
