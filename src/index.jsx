import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';

import './App.css'; // Optional: Create an App.css for styling

function App() {

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState([]);
    const pdfPages = [];

    const [formData, setFormData] = useState({
        c163: '',
        c1125: '',
        c1250: '',
        c1500: '',
        c11000: '',
        c12000: '',
        c14000: '',
        d163: '',
        d1125: '',
        d1250: '',
        d1500: '',
        d11000: '',
        d12000: '',
        d14000: '',
        o163: '',
        o1125: '',
        o1250: '',
        o1500: '',
        o11000: '',
        o12000: '',
        o14000: '',
        volume: '',
        distance: '1.5',
        diameter: '',
        ductWidth: '',
        ductHeight: '',
        ductLength: '',
        ductThickness: '0.7',
        branchArea: '',
        totalArea: '',
        TurningVanes: false,
        LinedDuct: false,
        ductwidth2: ''
    });
    const dimensionData = [
        { width: 300, height: 300, thickness: 0.70, frequencies: [21, 24, 27, 30, 33, 36, 41] },
        { width: 300, height: 600, thickness: 0.70, frequencies: [19, 22, 25, 28, 31, 35, 41] },
        { width: 300, height: 1200, thickness: 0.85, frequencies: [19, 22, 25, 28, 31, 37, 43] },
        { width: 600, height: 600, thickness: 0.85, frequencies: [20, 23, 26, 29, 32, 37, 43] },
        { width: 600, height: 1200, thickness: 1.00, frequencies: [20, 23, 26, 29, 31, 39, 45] },
        { width: 1200, height: 1200, thickness: 1.30, frequencies: [21, 24, 27, 30, 35, 41, 45] },
        { width: 1200, height: 2400, thickness: 1.30, frequencies: [19, 22, 25, 29, 35, 41, 45] },
    ];

    const pdf = new jsPDF();
    // Duct data from your provided example
    const ductData = {
        unlinedDuctWithoutTurningVanes: [
            {
                widthRange: "5:10",
                octaveBandMidFreq: [0, 0, 0, 1, 5, 8, 4, 3]
            },
            {
                widthRange: "11:20",
                octaveBandMidFreq: [0, 1, 5, 5, 8, 4, 3, 3]
            },
            {
                widthRange: "21:40",
                octaveBandMidFreq: [0, 5, 5, 8, 4, 3, 3, 3]
            },
            {
                widthRange: "41:80",
                octaveBandMidFreq: [1, 5, 8, 4, 3, 3, 3, 3]
            }
        ],
        linedDuctWithoutTurningVanes: [
            {
                widthRange: "5:10",
                octaveBandMidFreq: [0, 0, 0, 1, 6, 11, 10, 10]
            },
            {
                widthRange: "11:20",
                octaveBandMidFreq: [0, 1, 6, 6, 11, 10, 10, 10]
            },
            {
                widthRange: "21:40",
                octaveBandMidFreq: [0, 6, 6, 11, 10, 10, 10, 10]
            },
            {
                widthRange: "41:80",
                octaveBandMidFreq: [1, 6, 11, 10, 10, 10, 10, 10]
            }
        ],
        unlinedDuctWithTurningVanes: [
            {
                widthRange: "5:10",
                octaveBandMidFreq: [0, 0, 0, 1, 4, 6, 4, 4]
            },
            {
                widthRange: "11:20",
                octaveBandMidFreq: [0, 1, 4, 6, 4, 4, 4, 4]
            },
            {
                widthRange: "21:40",
                octaveBandMidFreq: [0, 4, 6, 6, 4, 4, 4, 4]
            },
            {
                widthRange: "41:80",
                octaveBandMidFreq: [1, 4, 6, 6, 4, 4, 4, 4]
            }
        ],
        linedDuctWithTurningVanes: [
            {
                widthRange: "5:10",
                octaveBandMidFreq: [0, 0, 0, 1, 4, 7, 7, 7]
            },
            {
                widthRange: "11:20",
                octaveBandMidFreq: [0, 1, 4, 7, 7, 7, 7, 7]
            },
            {
                widthRange: "21:40",
                octaveBandMidFreq: [0, 4, 7, 7, 7, 7, 7, 7]
            },
            {
                widthRange: "41:80",
                octaveBandMidFreq: [1, 4, 7, 7, 7, 7, 7, 7]
            }
        ]
    };

    // Function to get the octave band frequencies based on selected dimensions
    const getFrequencies = (ductWidth, ductHeight, ductThickness) => {
        for (let i = 0; i < dimensionData.length; i++) {
            let value = dimensionData[i];
            if (value.width <= ductWidth && value.height <= ductHeight && value.thickness === ductThickness) {
                console.log(value.frequencies, value);
                return value.frequencies; // Return the frequencies array when a match is found
            }
        }
        return []; // Return an empty array if no match is found
    };
    const calculateInsertionLoss = (P, Area, thickness, ductlength) => {

        let CoeffA = [-0.865, -0.582, -0.0121, 0.298, 0.089, 0.0649, 0.15];
        let CoeffB = [0.723, 0.826, 0.487, 0.513, 0.862, 0.629, 0.166];
        let CoeffC = [0.375, 0.975, 0.868, 0.317, 0, 0, 0];

        let frequencies = [125, 250, 500, 1000, 2000, 4000, 8000];
        let IL = [0,];

        for (let i = 0; i < frequencies.length - 1; i++) {
            let A = CoeffA[i];
            let B = CoeffB[i];
            let C = CoeffC[i];
            console.log(P / Area)
            // let insertionLoss = (Math.pow(10, A) * Math.pow((P / Area)  , B) * Math.pow(thickness, C))  ;
            let insertionLoss = Math.round(Math.pow(10, A) * Math.pow((P / Area), B) * Math.pow(thickness, C) * 10) / 10;
            let ittt = ductlength * insertionLoss;
            IL.push(insertionLoss);
        }

        return IL;
    };
    // Handle change for input fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        setFormData((prevState) => ({
            ...prevState,
            [name]: e.type === 'checkbox' ? checked : value
        }));
    };

    // Function to generate random colors for datasets
    const randomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const soundPowerLevelOutside = [
        formData.c163, formData.c1125, formData.c1250,
        formData.c1500, formData.c11000, formData.c12000,
        formData.c14000
    ];

    const dischargeSoundPower = [
        formData.d163, formData.d1125, formData.d1250,
        formData.d1500, formData.d11000, formData.d12000,
        formData.d14000
    ];

    const outletGeneratedSoundPower = [
        formData.o163, formData.o1125, formData.o1250,
        formData.o1500, formData.o11000, formData.o12000,
        formData.o14000
    ];

    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [newMaterialRows, setNewMaterialRows] = useState([]);  // Track multiple new material rows

    const [materialsData, setMaterialsData] = useState([
        {
            name: "Mineral Fiber",
            density: "20 [lb/ft³] / 300 [kg/m³]",
            thickness: "0.63 [in] / 16 [mm]",
            weight: "1 [lb/ft²] / 5 [kg/m²]",
            frequencies: [13, 16, 18, 20, 26, 31, 36],
            value: "MineralFiber 20 0.63 1"
        },
        {
            name: "Mineral Fiber",
            density: "10 [lb/ft³] / 160 [kg/m³]",
            thickness: "0.63 [in] / 16 [mm]",
            weight: "0.5 [lb/ft²] / 2.5 [kg/m²]",
            frequencies: [13, 15, 17, 19, 25, 30, 33],
            value: "MineralFiber 10 0.63 0.5"
        },
        {
            name: "Glass Fiber",
            density: "3 [lb/ft³] / 40 [kg/m³]",
            thickness: "0.63 [in] / 16 [mm]",
            weight: "0.1 [lb/ft²] / 0.7 [kg/m²]",
            frequencies: [13, 16, 15, 17, 17, 18, 19],
            value: "GlassFiber 3 0.63 0.1"
        },
        {
            name: "Glass Fiber",
            density: "4 [lb/ft³] / 60 [kg/m³]",
            thickness: "1.97 [in] / 50 [mm]",
            weight: "0.6 [lb/ft²] / 3 [kg/m²]",
            frequencies: [14, 17, 18, 21, 25, 29, 35],
            value: "GlassFiber 4 1.97 0.6"
        },
        {
            name: "Glass Fiber/TL Backed",
            density: "4 [lb/ft³] / 60 [kg/m³]",
            thickness: "1.97 [in] / 50 [mm]",
            weight: "0.6 [lb/ft²] / 3 [kg/m²]",
            frequencies: [14, 17, 18, 22, 27, 32, 39],
            value: "GlassFiber,TLBacked 4 1.97 0.6"
        },
        {
            name: "Gypsum Board Tiles",
            density: "43 [lb/ft³] / 690 [kg/m³]",
            thickness: "0.51 [in] / 13 [mm]",
            weight: "1.8 [lb/ft²] / 9 [kg/m²]",
            frequencies: [14, 16, 18, 18, 21, 22, 22],
            value: "GypsumBoardTiles 43 0.51 1.8"
        },
        {
            name: "Solid Gypsum Board",
            density: "43 [lb/ft³] / 690 [kg/m³]",
            thickness: "0.51 [in] / 13 [mm]",
            weight: "1.8 [lb/ft²] / 9 [kg/m²]",
            frequencies: [18, 21, 25, 25, 27, 27, 28],
            value: "SolidGypsumBoard 43 0.51 1.8"
        },
        {
            name: "Solid Gypsum Board",
            density: "43 [lb/ft³] / 690 [kg/m³]",
            thickness: "0.63 [in] / 16 [mm]",
            weight: "2.2 [lb/ft²] / 11 [kg/m²]",
            frequencies: [20, 23, 27, 27, 29, 29, 30],
            value: "SolidGypsumBoard 43 0.63 2.2"
        },
        {
            name: "Double Gypsum Board",
            density: "45 [lb/ft³] / 700 [kg/m³]",
            thickness: "0.98 [in] / 25 [mm]",
            weight: "3.7 [lb/ft²] / 18 [kg/m²]",
            frequencies: [24, 27, 31, 31, 33, 33, 34],
            value: "DoubleGypsumBoard 45 0.98 3.7"
        },
        {
            name: "Double Gypsum Board",
            density: "43 [lb/ft³] / 690 [kg/m³]",
            thickness: "1.26 [in] / 32 [mm]",
            weight: "4.5 [lb/ft²] / 22 [kg/m²]",
            frequencies: [26, 29, 33, 33, 35, 35, 36],
            value: "DoubleGypsumBoard 43 1.26 4.5"
        },
        {
            name: "Concealed Spline",
            density: "20 [lb/ft³] / 300 [kg/m³]",
            thickness: "0.63 [in] / 16 [mm]",
            weight: "1 [lb/ft²] / 5 [kg/m²]",
            frequencies: [20, 23, 21, 24, 29, 33, 34],
            value: "ConcealedSpline 20 0.63 1"
        }

    ]);

    const handleCheckboxChange = (value) => {
        setSelectedMaterials(prevState =>
            prevState.includes(value)
                ? prevState.filter(material => material !== value)
                : [...prevState, value]
        );
    };

    const handleInputChange = (e, rowIndex, field) => {

        const { name, value } = e.target;
        const updatedRows = [...newMaterialRows];
        if (name === 'frequencies') {
            const updatedFrequencies = [...updatedRows[rowIndex].frequencies];
            updatedFrequencies[field] = value;
            updatedRows[rowIndex] = { ...updatedRows[rowIndex], frequencies: updatedFrequencies };
        } else {
            updatedRows[rowIndex] = { ...updatedRows[rowIndex], [name]: value };
        }
        setNewMaterialRows(updatedRows);
    };

    const handleAddRow = (e) => {
        e.preventDefault();  // Prevent page reload
        setNewMaterialRows([...newMaterialRows, {
            name: '',
            density: '',
            thickness: '',
            weight: '',
            frequencies: Array(7).fill('')  // Create a new row with empty frequencies
        }]);
    };


    const handleSaveRow = (rowIndex) => {
        setMaterialsData([...materialsData, newMaterialRows[rowIndex]]);
        // Remove the row from the newMaterialRows list after saving
        const updatedRows = [...newMaterialRows];
        updatedRows.splice(rowIndex, 1);
        setNewMaterialRows(updatedRows);
    };
    const [chartData, setChartData] = useState(null);
    const [secondChartData, setSecondChartData] = useState(null); // State for the second chart
    const tableRef = useRef(null); // Reference to the first chart's canvas
    const chartRef = useRef(null); // Reference to the first chart's canvas
    const secondChartRef = useRef(null); // Reference to the second chart's canvas
    let chartInstance = useRef(null); // First chart instance
    let secondChartInstance = useRef(null); // Second chart instance

    // Create the chart once chartData is updated
    useEffect(() => {
        // Check if chartData and chartRef are available
        if (chartData && chartRef.current) {
            // Destroy the previous chart instance if it exists
            if (chartInstance.current) {
                console.log('Destroying chart instance');
                chartInstance.current.destroy();
            }

            // Create a new chart instance
            chartInstance.current = new Chart(chartRef.current, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'UNCORRECTED CEILING/SPACE EFFECT ATTENUATION VALUES'
                        },
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Frequency (Hz)',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Sound Power Level (dB)',
                            },
                        },
                    },
                },
            });

            // Delay the image download to ensure chart is rendered
            setTimeout(() => {
                const imageUrl = chartInstance.current.toBase64Image();
                // Add the canvas image to the PDF
                pdf.addImage(imageUrl, 'PNG', 0, 0, 170, 100); // A4 size in mm (210x297 mm)
                fetch('http://localhost:3003/save-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: imageUrl, filename: '61.png' }),
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('Image saved to public folder.');
                        } else {
                            console.error('Failed to save image.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                // Save the PDF with the name '6.pdf'
                pdf.save('6.pdf');
                pdfPages.push(imageUrl);
                pdf.addPage();  // Adds a new page
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = 'sound_power_chart.png';
                link.click();
            }, 500);  // Adjust timeout as needed
        }
        // Cleanup function to destroy the chart on component unmount
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartData]);

    // Second chart useEffect (updated)
    useEffect(() => {
        if (secondChartData && secondChartRef.current) {
            if (secondChartInstance.current) {
                secondChartInstance.current.destroy();
            }

            secondChartInstance.current = new Chart(secondChartRef.current, {
                type: 'line',
                data: secondChartData,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'SOUND POWER LEVELS OUTSIDE, DISCHARGE, AND GENERATED SOUND'
                        },
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Frequency (Hz)',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Sound Power Level (dB)',
                            },
                        },
                    },
                },
            });

            // Delay the image download to ensure second chart is rendered
            setTimeout(() => {
                const imageUrl = secondChartInstance.current.toBase64Image();
                // Send the base64 image data to the server
                // Send the base64 image data to the server
                fetch('http://localhost:3003/save-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: imageUrl, filename: '6.png' }),
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('Image saved to public folder.');
                        } else {
                            console.error('Failed to save image.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                pdf.addImage(imageUrl, 'PNG', 0, 0, 170, 100); // A4 size in mm (210x297 mm)

                // Save the PDF with the name '6.pdf'
                pdf.save('6.pdf');
                pdfPages.push(imageUrl);
                pdf.addPage();  // Adds a new page
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = 'second_sound_power_chart.png';
                link.click();
            }, 500);  // Adjust timeout as needed
        }

        return () => {
            if (secondChartInstance.current) {
                secondChartInstance.current.destroy();
            }
        };
    }, [secondChartData]);


    const calculateF = () => {
        const { branchArea, totalArea } = formData;
        console.log(branchArea, totalArea, formData)
        // Make sure branchArea and totalArea are valid numbers
        if (branchArea && totalArea && totalArea !== 0) {
            let f = 10 * Math.abs(Math.round(Math.log10(parseFloat(branchArea) / parseFloat(totalArea)) * 10) / 10);
            return f;
        }
        return null; // Return null if the values are invalid
    };

    // Determine the selected duct data based on form values
    const getSelectedDuctData = () => {
        const { TurningVanes, LinedDuct, ductwidth2 } = formData;
        let selectedDuctData = [];

        if (TurningVanes && LinedDuct) {
            selectedDuctData = ductData.linedDuctWithTurningVanes;
        } else if (TurningVanes && !LinedDuct) {
            selectedDuctData = ductData.unlinedDuctWithTurningVanes;
        } else if (!TurningVanes && LinedDuct) {
            selectedDuctData = ductData.linedDuctWithoutTurningVanes;
        } else {
            selectedDuctData = ductData.unlinedDuctWithoutTurningVanes;
        }

        const ductWidth = parseFloat(ductwidth2);
        let octaveBandMidFreq = null;

        // Find the correct octaveBandMidFreq based on duct width range
        for (let duct of selectedDuctData) {
            let [minWidth, maxWidth] = duct.widthRange.split(':').map(Number);
            if (ductWidth >= minWidth && ductWidth <= maxWidth) {
                octaveBandMidFreq = duct.octaveBandMidFreq;
                break;
            }
        }
        return octaveBandMidFreq;
    };

    function calculateLinedFlexibleDuctInsertionLoss(D, L) {
        let frequencies = [63, 125, 250, 500, 1000, 2000, 4000, 8000];

        // Array to store results
        let results = [];
        let C1Coefficients = [1, 2.601, -2.023119, 1.533116, 23.452, 26.15493, 25.06003, 10.03558];
        let C2Coefficients = [-0.05, -0.125061, 1.276239, 1.407587, -2.844882, -2.885191, -4.0431, -1.104969];
        let C3Coefficients = [-0.006339, 0.006339, -0.082116, -0.083166, 0.0851754, 0.0884209, 0.1626905, 0.0338121];
        let C4Coefficients = [0.48, 0.4852413, -0.691433, 1.948206, 0.8380425, 1.702466, 0.2239686, 1.504462];
        let C5Coefficients = [0.0757873, 0.07757873, 0.4378392, 0.0627173, 0.3254958, 0.1615714, 0.344374, -0.133883];
        let C6Coefficients = [-0.005221, -0.005221, -0.020816, -0.005056, -0.014685, -0.009956, -0.020039, 0.0043834];

        // Calculate for each frequency
        for (let i = 0; i < frequencies.length; i++) {
            let C1 = C1Coefficients[i];
            let C2 = C2Coefficients[i];
            let C3 = C3Coefficients[i];
            let C4 = C4Coefficients[i];
            let C5 = C5Coefficients[i];
            let C6 = C6Coefficients[i];

            let result = Math.round(C1 + C2 * D + C3 * Math.pow(D, 2) + (C4 + C5 * D + C6 * Math.pow(D, 2)) * L);

            results.push(result);
        }

        return results;
    }
    function findDuctRange(D) {
        // Define the ranges and corresponding frequencies
        const ranges = [
            { range: [4, 6], frequencies: [9, 9, 9, 9, 10, 12, 15, 21] },
            { range: [7, 8], frequencies: [8, 8, 8, 8, 9, 10, 13, 18] },
            { range: [9, 9], frequencies: [7, 7, 7, 8, 8, 10, 12, 17] },
            { range: [10, 10], frequencies: [7, 7, 7, 7, 8, 9, 11, 16] },
            { range: [12, 16], frequencies: [5, 5, 5, 5, 6, 7, 9, 13] },
        ];

        // Find the appropriate range
        for (let i = 0; i < ranges.length; i++) {
            if (D >= ranges[i].range[0] && D <= ranges[i].range[1]) {
                return ranges[i].frequencies;
            }
        }

        return null; // Return null if no range found
    } function calculateERL(D) {
        const Co = 1127;
        const Pi = 3.14159;
        const a1 = 0.7;
        const a2 = 2;
        let ERL = [];
        ERL[0] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 63 * (D / 12)), a2)));
        ERL[1] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 125 * (D / 12)), a2)));
        ERL[2] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 250 * (D / 12)), a2)));
        ERL[3] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 500 * (D / 12)), a2)));
        ERL[4] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 1000 * (D / 12)), a2)));
        ERL[5] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 2000 * (D / 12)), a2)));
        ERL[6] = Math.round(10 * Math.log10(1 + Math.pow((a1 * Co) / (Pi * 4000 * (D / 12)), a2)));
        console.log(ERL[0]);
        return ERL;
    }
    function calculateS(v, r) {
        let ERL = [];
        ERL[0] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(63) - 25);
        ERL[1] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(125) - 25);
        ERL[2] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(250) - 25);
        ERL[3] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(500) - 25);
        ERL[4] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(1000) - 25);
        ERL[5] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(2000) - 25);
        ERL[6] = Math.round(10 * Math.log10(r) + 5 * Math.log10(v) + 3 * Math.log10(4000) - 25);
        console.log(ERL[0]);
        return ERL;
    }

    const frequencies = [63, 125, 250, 500, 1000, 2000, 4000];
    const Enviro = [4, 2, 1, 0, 0, 0, 0];
    // Trigger chart creation when chartData changes
    const [image, setImage] = useState(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        setImage(new Image())
        // Example formData data (replace with actual formData values)
        const soundPowerLevelOutside = [
            formData.c163, formData.c1125, formData.c1250,
            formData.c1500, formData.c11000, formData.c12000,
            formData.c14000
        ];

        const dischargeSoundPower = [
            formData.d163, formData.d1125, formData.d1250,
            formData.d1500, formData.d11000, formData.d12000,
            formData.d14000
        ];

        const outletGeneratedSoundPower = [
            formData.o163, formData.o1125, formData.o1250,
            formData.o1500, formData.o11000, formData.o12000,
            formData.o14000
        ];

        // Create the second chart data
        const newSecondChartData = {
            labels: [63, 125, 250, 500, 1000, 2000, 4000],
            datasets: [
                {
                    label: 'sound Power Level Outside',
                    data: soundPowerLevelOutside,
                    borderColor: randomColor(),  // Choose a color
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Discharge Sound Power',
                    data: dischargeSoundPower,
                    borderColor: randomColor(),  // Choose a color
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Outlet Generated Sound Power',
                    data: outletGeneratedSoundPower,
                    borderColor: randomColor(),  // Choose a color
                    fill: false,
                    tension: 0.1
                }
            ]
        };
        setSecondChartData(newSecondChartData);
        const table = tableRef.current;
        const rowCount = table.rows.length;

        let datasets = [];
        let freqSums = {
            '63Hz': 0,
            '125Hz': 0,
            '250Hz': 0,
            '500Hz': 0,
            '1000Hz': 0,
            '2000Hz': 0,
            '4000Hz': 0
        };

        // Loop through the table rows and check for selected materials
        for (let i = 1; i < rowCount; i++) {
            const row = table.rows[i];
            const checkbox = row.cells[0].querySelector('input[type="checkbox"]');

            if (checkbox && checkbox.checked) {
                const rowData = {
                    material: row.cells[1].innerText || row.cells[1].querySelector('input').value,
                    density: row.cells[2].innerText || row.cells[2].querySelector('input').value,
                    thickness: row.cells[3].innerText || row.cells[3].querySelector('input').value,
                    weight: row.cells[4].innerText || row.cells[4].querySelector('input').value,
                    freqs: [
                        parseFloat(row.cells[5].innerText || row.cells[5].querySelector('input').value),
                        parseFloat(row.cells[6].innerText || row.cells[6].querySelector('input').value),
                        parseFloat(row.cells[7].innerText || row.cells[7].querySelector('input').value),
                        parseFloat(row.cells[8].innerText || row.cells[8].querySelector('input').value),
                        parseFloat(row.cells[9].innerText || row.cells[9].querySelector('input').value),
                        parseFloat(row.cells[10].innerText || row.cells[10].querySelector('input').value),
                        parseFloat(row.cells[11].innerText || row.cells[11].querySelector('input').value)
                    ]
                };

                datasets.push({
                    label: rowData.material,
                    data: rowData.freqs,
                    borderColor: randomColor(), // Helper function to generate random colors
                    fill: false,
                    tension: 0.1 // Smooth curve
                });

                // Update frequency sums
                freqSums['63Hz'] += rowData.freqs[0];
                freqSums['125Hz'] += rowData.freqs[1];
                freqSums['250Hz'] += rowData.freqs[2];
                freqSums['500Hz'] += rowData.freqs[3];
                freqSums['1000Hz'] += rowData.freqs[4];
                freqSums['2000Hz'] += rowData.freqs[5];
                freqSums['4000Hz'] += rowData.freqs[6];
            }
        }

        // Prepare data for the chart
        const newChartData = {
            labels: [63, 125, 250, 500, 1000, 2000, 4000],
            datasets: datasets
        };

        // Update the chart data in the state
        setChartData(newChartData);

        // Prepare the p array for additional calculations
        let p = [
            freqSums['63Hz'],
            freqSums['125Hz'],
            freqSums['250Hz'],
            freqSums['500Hz'],
            freqSums['1000Hz'],
            freqSums['2000Hz'],
            freqSums['4000Hz']
        ];
        let ductWidth = parseFloat(formData.ductWidth);
        let ductHeight = parseFloat(formData.ductHeight);
        let ductLength = parseFloat(formData.ductLength);
        let diameter = parseFloat(formData.diameter);
        let ductThickness = parseFloat(formData.ductThickness);
        let branchArea = parseFloat(formData.branchArea);
        let totalArea = parseFloat(formData.totalArea);
        let volume = parseFloat(formData.volume);
        let distance = parseFloat(formData.distance);

        // Convert to meters (if needed) and calculate necessary values
        let ductWidthInMeters = ductWidth / 304.8;
        let ductHeightInMeters = ductHeight / 304.8;
        let area = ductWidthInMeters * ductHeightInMeters;
        let perimeter = 2 * (ductWidthInMeters + ductHeightInMeters);

        // Call the insertion loss calculation
        let i1 = calculateInsertionLoss(perimeter, area, ductThickness, ductLength);
        let i12 = Math.round(Math.log(10, ductLength / 10) * 10) / 10;
        i12 = Array(7).fill(i12);

        let i2 = i1.map((element, index) => Math.round((element + i12[index]) * 10) / 10);

        // Output results (can be displayed in a table or similar)
        console.log(i1, i12, i2);

        // Fetch frequencies based on dimensions
        let b23 = getFrequencies(ductWidth, ductHeight, ductThickness);

        const T = getSelectedDuctData().slice(0, 7);

        let f = Array(7).fill(calculateF());
        let i3, b4, r;
        if (diameter != '') {
            i3 = calculateLinedFlexibleDuctInsertionLoss(diameter, ductLength).slice(0, 7);
            b4 = findDuctRange(diameter).slice(0, 7);
            r = calculateERL(diameter);
        }
        else {

            i3 = calculateLinedFlexibleDuctInsertionLoss(perimeter, ductLength).slice(0, 7);
            b4 = findDuctRange(perimeter).slice(0, 7);
            r = calculateERL(perimeter);
        }
        let s = calculateS(volume * 3.281 * 3.281 * 3.281, distance * 3.281);
        // Add rows to the table (frequencies and soundPowerLevelOutside)
        const equation1 = (soundPowerLevelOutside, Enviro, p) => {
            let results = []; // Store the calculated values for the row

            // Loop through each frequency index and calculate the value
            for (let i = 0; i < 7; i++) {
                let c1Val = soundPowerLevelOutside[i] ?? 0;  // Default to 0 if undefined
                let EnviroVal = Enviro[i] ?? 0;  // Default to 0 if undefined
                let pVal = p[i] ?? 0;  // Default to 0 if undefined

                // Calculate the result and round it
                let temp = Math.round(c1Val - EnviroVal - pVal);

                // Store the result or a '-' if the value is less than 0
                results[i] = temp;
            }

            return results; // Return the array of results
        };
        const equation2 = (dischargeSoundPower, Enviro, p, i1, i12, b23) => {
            let results = []; // Store the calculated values for the row

            for (let i = 0; i < 7; i++) {
                let d1Val = dischargeSoundPower[i] ?? 0;
                let EnviroVal = Enviro[i] ?? 0;
                let i1Val = i1[i] ?? 0;
                let i12Val = i12[i] ?? 0;
                let b23Val = b23[i] ?? 0;
                let pVal = p[i] ?? 0;

                let temp = Math.round(d1Val - EnviroVal - Math.round((i1Val + i12Val) * 10) / 10 - b23Val - pVal);
                results[i] = temp;
            }
            return results; // Return the array of results
        }
        const equation3 = (dischargeSoundPower, Enviro, i1, i12, T, f, b23, p) => {
            let results = []; // Store the calculated values for the row
            for (let i = 0; i < 7; i++) {
                let d1Val = dischargeSoundPower[i] ?? 0;
                let EnviroVal = Enviro[i] ?? 0;
                let i1Val = i1[i] ?? 0;
                let i12Val = i12[i] ?? 0;
                let TVal = T[i] ?? 0;
                let fVal = f[i] ?? 0;
                let b23Val = b23[i] ?? 0;
                let pVal = p[i] ?? 0;

                let temp = Math.round(10 * (d1Val - EnviroVal - Math.round((i1Val + i12Val) * 10) / 10 - TVal - fVal - 0 - b23Val - pVal)) / 10;
                console.log(d1Val, EnviroVal, i1Val, i12Val, b23Val, fVal, TVal, pVal, temp)
                results[i] = temp;
            }
            console.log(results)
            return results; // Return the array of results

        }
        const equation4 = (dischargeSoundPower, Enviro, i1, i12, T, f, i3, b4, p) => {
            let results = []; // Store the calculated values for the row
            for (let i = 0; i < 7; i++) {
                let d1Val = dischargeSoundPower[i] ?? 0;
                let EnviroVal = Enviro[i] ?? 0;
                let i1Val = i1[i] ?? 0;
                let i12Val = i12[i] ?? 0;
                let TVal = T[i] ?? 0;
                let fVal = f[i] ?? 0;
                let i3Val = i3[i] ?? 0;
                let b4Val = b4[i] ?? 0;
                let pVal = p[i] ?? 0;

                let temp = Math.round(10 * (d1Val - EnviroVal - Math.round((i1Val + i12Val) * 10) / 10 - TVal - fVal - 0 - i3Val - b4Val - pVal)) / 10;
                results[i] = temp;
            }
            console.log(results)
            return results; // Return the array of results

        }

        const equation5 = (dischargeSoundPower, Enviro, i1, i12, T, f, i3, r, s) => {
            let results = []; // Store the calculated values for the row

            for (let i = 0; i < 7; i++) {
                let d1Val = dischargeSoundPower[i] ?? 0;
                let EnviroVal = Enviro[i] ?? 0;
                let i1Val = i1[i] ?? 0;
                let i12Val = i12[i] ?? 0;
                let TVal = T[i] ?? 0;
                let fVal = f[i] ?? 0;
                let i3Val = i3[i] ?? 0;
                let rVal = r[i] ?? 0;
                let sVal = s[i] ?? 0;
                console.log(d1Val, EnviroVal, i1Val, i12Val, TVal, fVal, i3Val, rVal, sVal)
                let temp = Math.round(10 * (d1Val - EnviroVal - Math.round((i1Val + i12Val) * 10) / 10 - TVal - fVal - 0 - i3Val - rVal - sVal)) / 10;
                console.log(d1Val, EnviroVal, i1Val, i12Val, TVal, fVal, i3Val, rVal, sVal, temp)
                results[i] = temp;
            }
            return results; // Return the array of results
        }

        const equation6 = (o1, Enviro, s) => {
            let results = []; // Store the calculated values for the row

            for (let i = 0; i < 7; i++) {
                let o1Val = o1[i] ?? 0;
                let EnviroVal = Enviro[i] ?? 0;
                let sVal = s[i] ?? 0;

                let temp = o1Val - EnviroVal - sVal;
                results[i] = temp;
            }
            return results; // Return the array of results
        }
        const totalEquation = (Equation1, Equation2, Equation3, Equation4, Equation5, Equation6) => {
            let results = []; // Store the calculated values for the row
            for (let i = 0; i < 7; i++) {
                let total = 0; // Initialize total to zero

                // Calculate total conditionally based on whether each equation is valid and positive
                if (Equation1[i] !== "-" && Equation1[i] > 0) {
                    total += 10 * Math.log10(Equation1[i]);
                }

                if (Equation2[i] !== "-" && Equation2[i] > 0) {
                    total += 10 * Math.log10(Equation2[i]);
                }

                if (Equation3[i] !== "-" && Equation3[i] > 0) {
                    total += 10 * Math.log10(Equation3[i]);
                }

                if (Equation4[i] !== "-" && Equation4[i] > 0) {
                    total += 10 * Math.log10(Equation4[i]);
                }

                if (Equation5[i] !== "-" && Equation5[i] > 0) {
                    total += 10 * Math.log10(Equation5[i]);
                }

                if (Equation6[i] !== "-" && Equation6[i] > 0) {
                    total += 10 * Math.log10(Equation6[i]);
                }

                console.log(Equation1[i], Equation2[i], Equation3[i], Equation4[i], Equation5[i], Equation6[i], total);
                results[i] = Math.round(total * 10) / 10;
            }
            return results; // Return the array of results
        };

        const radiatedAndInductionInletData = equation1(soundPowerLevelOutside, Enviro, p);
        const DuctBreakoutPath = equation2(dischargeSoundPower, Enviro, p, i1, i12, b23);
        const DistributionDuctBreakout = equation3(dischargeSoundPower, Enviro, i1, i12, T, f, b23, p);
        const FlexibleDuctBreakoutPath = equation4(dischargeSoundPower, Enviro, i1, i12, T, f, i3, b4, p);
        const DischargePath = equation5(dischargeSoundPower, Enviro, i1, i12, T, f, i3, r, s);
        const Outlet1Generated = equation6(outletGeneratedSoundPower, Enviro, s);
        setTotal(totalEquation(radiatedAndInductionInletData, DuctBreakoutPath, DistributionDuctBreakout, FlexibleDuctBreakoutPath, DischargePath, Outlet1Generated));
        setRows([{
            label: 'Radiated and induction inlet Lw (from mfr’s data)',
            data: soundPowerLevelOutside
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: 'Ceiling/Space Effect',
            data: p
        }, {
            label: 'Radiated and Induction Inlet',
            data: radiatedAndInductionInletData
        }, {
            label: 'Terminal discharge Lw (from mfr’s data)',
            data: dischargeSoundPower
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: 'lined rectangular duct',
            data: i1
        }, {
            label: 'inverse square law',
            data: i12
        }, {
            label: 'lined rectangular duct+inverse square law',
            data: i2
        }, {
            label: 'Duct breakout noise',
            data: b23
        }, {
            label: 'Ceiling/Space Effect',
            data: p
        }, {
            label: 'Duct Breakout Path',
            data: DuctBreakoutPath
        }, {
            label: 'Terminal discharge (Lw from mfr’s data)',
            data: dischargeSoundPower
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: 'lined rectangular duct',
            data: i1
        }, {
            label: 'inverse square law',
            data: i12
        }, {
            label: 'lined rectangular duct+inverse square law',
            data: i2
        }, {
            label: 'Rectangular Tee attenuation entering branch duct',
            data: T
        }, {
            label: 'Branch power division ',
            data: f
        }, {
            label: "unlined rectangular duct",
            data: [0, 0, 0, 0, 0, 0, 0]
        }, {
            label: "Duct breakout, non-metallic flexible duct",
            data: b23
        }, {
            label: 'Ceiling/Space Effect',
            data: p
        }, {
            label: 'Distribution Duct Breakout',
            data: DistributionDuctBreakout
        }, {
            label: 'Terminal discharge (Lw from mfr’s data)',
            data: dischargeSoundPower
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: 'lined rectangular duct',
            data: i1
        }, {
            label: 'inverse square law',
            data: i12
        }, {
            label: 'lined rectangular duct+inverse square law',
            data: i2
        }, {
            label: 'Rectangular Tee attenuation entering branch duct',
            data: T
        }, {
            label: 'Branch power division ',
            data: f
        }, {
            label: "unlined rectangular duct",
            data: [0, 0, 0, 0, 0, 0, 0]
        }
            , {
            label: "diameter nonmetallic flexible duct",
            data: i3
        }, {
            label: "Duct breakout, non-metallic flexible duct",
            data: b4
        }, {
            label: 'Ceiling/Space Effect',
            data: p
        }, {
            label: 'Flexible Duct Breakout Path',
            data: FlexibleDuctBreakoutPath
        }, {
            label: 'Terminal discharge (Lw from mfr’s data)',
            data: dischargeSoundPower
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: 'lined rectangular duct',
            data: i1
        }, {
            label: 'inverse square law',
            data: i12
        }, {
            label: 'lined rectangular duct+inverse square law',
            data: i2
        }, {
            label: 'Rectangular Tee attenuation entering branch duct',
            data: T
        }, {
            label: 'Branch power division ',
            data: f
        }, {
            label: "unlined rectangular duct",
            data: [0, 0, 0, 0, 0, 0, 0]
        }, {
            label: "diameter nonmetallic flexible duct",
            data: i3
        }, {
            label: "End reflection Factor",
            data: r
        }, {
            label: "Space Effect",
            data: s
        }, {
            label: 'Discharge Path',
            data: DischargePath
        }, {
            label: 'Outlet generated Lw ((from mfr’s data)',
            data: outletGeneratedSoundPower
        }, {
            label: 'Environmental Adjustment Factor',
            data: Enviro
        }, {
            label: "Space Effect",
            data: s
        }, {
            label: 'Outlet #1 Generated',
            data: Outlet1Generated
        }, {
            label: 'Total',
            data: total
        }]);

        console.log(p); // For debugging, you can add further logic here
    };

    // Chart refs
    // const chartRef1 = useRef(null);
    // const chartRef2 = useRef(null);

    // const [chartImage1, setChartImage1] = useState(null);
    // const [chartImage2, setChartImage2] = useState(null);

    // // Generate PDF function
    // const generatePDF = () => {
    //     const pdf = new jsPDF();
    //     pdf.setFontSize(20);
    //     pdf.text("Frequency Data Report", 10, 10);

    //     const imgWidth = pdf.internal.pageSize.getWidth() - 20;
    //     const imgHeight = 70;
    //     let yOffset = 30;

    //     if (image) {
    //         pdf.addImage(chartImage1, 'PNG', 10, yOffset, imgWidth, imgHeight);
    //         yOffset += imgHeight + 10;
    //     }
    //     if (chartImage2) {
    //         pdf.addImage(chartImage2, 'PNG', 10, yOffset, imgWidth, imgHeight);
    //     }

    //     pdf.save("frequency_data_report.pdf");
    // };

    // useEffect(() => {
    //     let chart1, chart2;

    //     const ctx1 = chartRef.current.getContext('2d');
    //     chart1 = new Chart(ctx1, {
    //         type: 'line',
    //         data: {
    //             labels: [63, 125, 250, 500, 1000, 2000, 4000, 8000],
    //             datasets: [{
    //                 label: 'Sound Power Level Outside',
    //                 data: [
    //                     formData.c163, formData.c1125, formData.c1250,
    //                     formData.c1500, formData.c11000, formData.c12000,
    //                     formData.c14000
    //                 ],
    //                 borderColor: 'rgba(255, 99, 132, 1)',
    //                 fill: false
    //             }]
    //         },
    //         options: { responsive: true, scales: { y: { beginAtZero: true } } }
    //     });
    //     setChartImage1(chart1.toBase64Image());

    //     const ctx2 = secondChartRef.current.getContext('2d');
    //     chart2 = new Chart(ctx2, {
    //         type: 'line',
    //         data: {
    //             labels: [63, 125, 250, 500, 1000, 2000, 4000],
    //             datasets: [
    //                 { label: 'Discharge Sound Power', data: [], borderColor: 'rgba(54, 162, 235, 1)', fill: false }
    //             ]
    //         },
    //         options: { responsive: true, scales: { y: { beginAtZero: true } } }
    //     });
    //     setChartImage2(chart2.toBase64Image());
    //     generatePDF();
    //     // Cleanup function to destroy charts
    //     return () => {
    //         if (chart1) chart1.destroy();
    //         if (chart2) chart2.destroy();
    //     };
    // }, [total]);

    const [tableData, setTableData] = useState({
        frequencies: [63, 125, 500, 1000, 2000, 4000, 8000],
        soundPowerLevelOutside: [
            formData.c163, formData.c1125, formData.c1250,
            formData.c1500, formData.c11000, formData.c12000,
            formData.c14000
        ]
    });
    // Render each row dynamically
    const renderRow = (row) => {
        console.log(row)
        return (
            <tr key={row.label}>
                <td>{row.label}</td>
                {row.data.map((value, index) => (
                    <td key={index}>{value}</td>
                ))}
            </tr>
        );
    };

    const [imagePreview, setImagePreview] = useState(null);

    // Handle image input
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result); // Set the image as base64 data
                setImagePreview(URL.createObjectURL(file)); // For image preview
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const generatePDF = () => {
            const doc = new jsPDF();

            const watermarkImage = new Image();
            watermarkImage.src = `${process.env.PUBLIC_URL}/image.png`;

            watermarkImage.onload = () => {
                const watermarkWidth = 220;
                const watermarkHeight = 330;
                doc.addImage(watermarkImage, 'PNG', 0, 0, watermarkWidth, watermarkHeight, undefined, 'FAST', 0.3);

                doc.setFontSize(12);
                const introText = `                     1. The airborne sound from the system central fan;
                    2. Airborne regenerated sound from upstream takeoffs and fittings;
                    3. Sound traveling upstream from the terminal.`
                    ;
                doc.text(introText, 10, 20);

                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text("6. Calculation Procedures for Estimating Sound Levels in Occupied Spaces", 10, 40);

                doc.setFontSize(14);
                doc.text("6.1 Introduction.", 10, 60);

                const descriptionText = `
                The source paths which must be evaluated to enable the net sound level in a 
                conditioned space to be estimated. Each path is broken into the individual 
                source and attenuation segments. Source sound levels are obtained from
                the terminal or outlet manufacturer’s data and path factor attenuation is 
                determined according to the procedures which follow.
                The designer must select paths from the acoustic models which match the 
                particular applications of the job. The Air terminal are also applied with 
                extended discharge plenums and lateral take-offs. Each application will 
                require a specific acoustic model. If the designer knows which paths are 
                most significant, the calculation procedure can be simplified. Otherwise, 
                it is recommended that all paths of the specific acoustic model be evaluated 
                until the designer is comfortable with a simplified model.
    
                
            `; // Detailed description text
                doc.text(descriptionText, 5, 70);

                doc.setFontSize(14);
                doc.text("Typical Manufacturer’s Catalog, dB", 10, 150);

                const img = new Image();
                img.src = image; // Base64 image
                img.onload = () => {
                    // Save the image as PNG
                    // Add the image (JPEG) on top of the watermark
                    doc.addImage(img, 'JPEG', 27, 170, 150, 100);

                    // Save the PDF after all content has been added (image + text + watermark)
                    doc.save('dataPDF.pdf');
                };
            };
        };
        generatePDF();
    }, [image]);

    const canvasRef = useRef(null);
    useEffect(() => {
        const generatePNG = () => {
            // Now use jsPDF to save this canvas image as a PDF
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Set canvas size to A4 dimensions at 72 DPI
            const width = 595; // A4 width in pixels
            const height = 842; // A4 height in pixels
            canvas.width = width;
            canvas.height = height;

            // Load watermark image
            const watermarkImage = new Image();
            watermarkImage.src = `${process.env.PUBLIC_URL}/image.png`;

            watermarkImage.onload = () => {
                // Draw watermark (adjust opacity)
                ctx.drawImage(watermarkImage, 0, 0, 595, 842);
                // Set font style for intro text

                // Set font style for intro text (adjust for new page size)
                ctx.font = `12px Arial`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'left';

                // Add margins
                const topMargin = 60; // Start further down to avoid overlap with watermark
                let yPosition = topMargin;

                // Draw intro text
                const introText = `                    1. The airborne sound from the system central fan
                    2. Airborne regenerated sound from upstream takeoffs and fittings
                    3. Sound traveling upstream from the terminal.`;

                const introLines = introText.split('\n');
                introLines.forEach(line => {
                    ctx.fillText(line, 15, yPosition);
                    yPosition += 12 * 1.5; // Adjust y-position for next line (increased line spacing)
                });
                yPosition += 16 * 2; // Add space after title

                ctx.font = `14px Arial`;
                ctx.fillText("6. Calculation Procedures for Estimating Sound Levels in Occupied Spaces", 60, yPosition);
                yPosition += 16 * 2; // Add space after title

                // Draw subheading (same font size as intro)
                ctx.font = `12px Arial`;
                ctx.fillText("6.1 Introduction.", 60, yPosition);
                yPosition += 12 * 2; // Add space after subheading

                // Draw description text (same font size as intro)
                const descriptionText = `
    The source paths which must be evaluated to enable the net sound level in a 
    conditioned space to be estimated. Each path is broken into the individual 
    source and attenuation segments. Source sound levels are obtained from
    the terminal or outlet manufacturer’s data and path factor attenuation is 
    determined according to the procedures which follow.
    The designer must select paths from the acoustic models which match the 
    particular applications of the job. The Air terminal are also applied with 
    extended discharge plenums and lateral take-offs. Each application will 
    require a specific acoustic model. If the designer knows which paths are 
    most significant, the calculation procedure can be simplified. Otherwise, 
    it is recommended that all paths of the specific acoustic model be evaluated 
    until the designer is comfortable with a simplified model.`;

                // Split the description text into lines to fit within the page width
                const descriptionLines = descriptionText.split('\n');
                descriptionLines.forEach(line => {
                    ctx.fillText(line, 60, yPosition);
                    yPosition += 12 * 1.5; // Add space after each line
                });

                yPosition += 16 * 2; // Add space after title
                // Draw footer text (similar to PDF)
                ctx.font = '14px Arial';
                ctx.fillText("Typical Manufacturer’s Catalog, dB", 60, yPosition);
                yPosition += 12 * 2; // Add space after each line

                // Load and draw additional image
                const img = new Image();
                img.src = image; // Base64 or image URL
                img.onload = () => {
                    ctx.drawImage(img, 60, yPosition, 495, 242); // Same positioning as PDF

                    // Convert canvas to PNG
                    const pngUrl = canvas.toDataURL('image/png');

                    pdfPages.push(pngUrl);
                };
            };
        };

        generatePNG();
    }, [image]);
    useEffect(() => {
        pdfPages.forEach(element => {
            console.log(element)
            pdf.addImage(element, 'PNG', 0, 0, 210, 297);
        });

        pdf.save('6.pdf');
    }, pdfPages)

    return (

        <div className="container">
            <h1>NC Curve Calculator</h1>
            <form>
                {/* Sound Power Level Section */}
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            <td>63</td>
                            <td>125</td>
                            <td>250</td>
                            <td>500</td>
                            <td>1000</td>
                            <td>2000</td>
                            <td>4000</td>
                            <td>8000</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sound Power Level outside</td>
                            <td><input type="number" name="c163" value={formData.c163} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c1125" value={formData.c1125} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c1250" value={formData.c1250} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c1500" value={formData.c1500} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c11000" value={formData.c11000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c12000" value={formData.c12000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c14000" value={formData.c14000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="c18000" value={formData.c18000} onChange={handleChange} step="0.1" /></td>
                        </tr>
                        <tr>
                            <td> discharge Sound Power</td>
                            <td><input type="number" name="d163" value={formData.d163} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d1125" value={formData.d1125} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d1250" value={formData.d1250} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d1500" value={formData.d1500} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d11000" value={formData.d11000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d12000" value={formData.d12000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d14000" value={formData.d14000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="d18000" value={formData.d18000} onChange={handleChange} step="0.1" /></td>
                        </tr>
                        <tr>
                            <td>outlet generated Sound Power</td>
                            <td><input type="number" name="o163" value={formData.o163} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o1125" value={formData.o1125} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o1250" value={formData.o1250} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o1500" value={formData.o1500} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o11000" value={formData.o11000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o12000" value={formData.o12000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o14000" value={formData.o14000} onChange={handleChange} step="0.1" /></td>
                            <td><input type="number" name="o18000" value={formData.o18000} onChange={handleChange} step="0.1" /></td>
                        </tr>
                        {/* Repeat similar input fields for all other form values */}
                    </tbody>
                </table>

                {/* Rectangular Duct Dimensions */}
                {/* <div className="data">
                    <h3>Lined Rectangular Duct Dimensions</h3>
                    <div>
                        <label>Width</label>
                        <input type="text" name="width" value={formData.width} onChange={handleChange} placeholder="in feet" />
                    </div>
                    <div>
                        <label>Length</label>
                        <input type="text" name="length" value={formData.length} onChange={handleChange} placeholder="in feet" />
                    </div>
                    <div>
                        <label>Thickness</label>
                        <input type="text" name="thickness" value={formData.thickness} onChange={handleChange} placeholder="Default is 1in / 25mm" />
                    </div>
                </div> */}

                {/* Room Dimensions */}
                <div className="data">
                    <h3>Room Dimensions</h3>
                    <div>
                        <label>Volume</label>
                        <input type="text" name="volume" value={formData.volume} onChange={handleChange} placeholder="in inch" />
                    </div>
                    <div>
                        <label>Distance</label>
                        <select name="distance" value={formData.distance} onChange={handleChange}>
                            <option value="1.5">5.0 ft [1.5 m]</option>
                            <option value="3">10 ft [3 m]</option>
                            <option value="4.6">15 ft [4.6 m]</option>
                        </select>
                    </div>
                </div>
                <div className="data">
                    <h3>Rectangle Tee Loss</h3>
                    <div style={{ float: "left" }}>
                        <input type="checkbox" id="TurningVanes" name="TurningVanes" onChange={handleChange} />
                        <label for="TurningVanes">Turning Vanes</label>
                    </div>
                    <div style={{ float: "right", marginRight: "60%" }}>
                        <input type="checkbox" id="LinedDuct" name="LinedDuct" onChange={handleChange} />
                        <label for="LinedDuct">Lined Duct</label>
                    </div>
                    <br />
                    <br />
                    <br />
                    <div>
                        <label>Width</label>
                        <input type="text" id="ductwidth2" name="ductwidth2" placeholder="in inch" onChange={handleChange} />
                    </div>
                </div>

                {/* Duct Dimensions */}
                <div className="data">
                    <h3>Duct Dimensions</h3>
                    <div>
                        <label>Duct Diameter</label>
                        <input type="text" name="diameter" value={formData.diameter} onChange={handleChange} placeholder="in inch" />
                    </div>
                    <div>
                        <label>Duct Width</label>
                        <input type="text" name="ductWidth" value={formData.ductWidth} onChange={handleChange} placeholder="in mm" />
                    </div>
                    <div>
                        <label>Duct Height</label>
                        <input type="text" name="ductHeight" value={formData.ductHeight} onChange={handleChange} placeholder="in mm" />
                    </div>
                    <div>
                        <label>Length</label>
                        <input type="text" name="ductLength" value={formData.ductLength} onChange={handleChange} placeholder="in mm" />
                    </div>
                    <div>
                        <label>Duct Thickness</label>
                        <select name="ductThickness" value={formData.ductThickness} onChange={handleChange}>
                            <option value="0.7">0.028in / 0.70mm</option>
                            <option value="0.85">0.034in / 0.85mm</option>
                            <option value="1">0.044in / 1.00mm</option>
                            <option value="1.3">0.054in / 1.30mm</option>
                        </select>
                    </div>
                </div>

                <div class="data">
                    <h3>Branch Power Division</h3>
                    <div>
                        <label for="branchArea">Branch Cross-Sectional Area (B): </label>
                        <input type="text" id="branchArea" name="branchArea" placeholder="Enter value for B" onChange={handleChange} />
                    </div>
                    <div>
                        <label for="totalArea">Total Cross-Sectional Area (T): </label>
                        <input type="text" id="totalArea" name="totalArea" placeholder="Enter value for T" onChange={handleChange} />
                    </div>
                </div>

                <div class="data">
                    <h3>Machine Image</h3>
                    <div>
                        <label htmlFor="machineImage" className="machineImage">Upload Machine Image</label>
                        <input
                            type="file"
                            id="machineImage"
                            name="machineImage"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Display image preview */}
                    {imagePreview && <img src={imagePreview} alt="Image Preview" width="200" />}

                </div>

                <div>
                    <table class="table2" id="table2" ref={tableRef}>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Material Name</th>
                                <th>Density</th>
                                <th>Thickness</th>
                                <th>Weight</th>
                                <th>63Hz</th>
                                <th>125Hz</th>
                                <th>250Hz</th>
                                <th>500Hz</th>
                                <th>1000Hz</th>
                                <th>2000Hz</th>
                                <th>4000Hz</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialsData.map((material, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            name="material"
                                            value={material.value}
                                            checked={selectedMaterials.includes(material.value)}
                                            onChange={() => handleCheckboxChange(material.value)}
                                        />
                                    </td>
                                    <td>{material.name}</td>
                                    <td>{material.density}</td>
                                    <td>{material.thickness}</td>
                                    <td>{material.weight}</td>
                                    {material.frequencies.map((freq, index) => (
                                        <td key={index}>{freq}</td>
                                    ))}
                                </tr>
                            ))}

                            {/* New Material Input Rows */}
                            {newMaterialRows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            name="newMaterialCheckbox"
                                            onChange={() => handleCheckboxChange(rowIndex)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="name"
                                            value={row.name}
                                            onChange={(e) => handleInputChange(e, rowIndex, null)}
                                            placeholder="Name"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="density"
                                            value={row.density}
                                            onChange={(e) => handleInputChange(e, rowIndex, null)}
                                            placeholder="Density"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="thickness"
                                            value={row.thickness}
                                            onChange={(e) => handleInputChange(e, rowIndex, null)}
                                            placeholder="Thickness"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="weight"
                                            value={row.weight}
                                            onChange={(e) => handleInputChange(e, rowIndex, null)}
                                            placeholder="Weight"
                                        />
                                    </td>
                                    {row.frequencies.map((freq, index) => (
                                        <td key={index}>
                                            <input
                                                type="number"
                                                name="frequencies"
                                                value={freq}
                                                onChange={(e) => handleInputChange(e, rowIndex, index)}
                                                placeholder={``}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}

                        </tbody>
                    </table>
                    <button id="addrowbutton" onClick={handleAddRow}>Add Material</button>

                </div>

                {/* Add buttons for generating PDF */}
                <button type="button" id="submit" onClick={handleSubmit}>submit</button>
            </form >
            <table border="1" class="table2" id="table2">
                <thead>
                    <tr>
                        <th>Label</th>
                        {frequencies.map((freq, index) => (
                            <th key={index}>{freq}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(renderRow)} {/* Render rows dynamically */}
                </tbody>
            </table>

            {/* NC Rating Section */}
            <h2>NC Rating:</h2>
            <p id="ncResult">Enter values to see the NC Rating</p>

            {/* NC Chart Canvas */}
            {/* <canvas id="ncChart" width="800" height="400"></canvas> */}

            {/* Render the chart as a hidden canvas */}
            {
                chartData && (
                    <canvas ref={chartRef} width="400" height="400" style={{ display: 'none' }}></canvas>
                )
            }
            {/* Render the chart as a hidden canvas */}
            {
                secondChartData && (
                    <canvas ref={secondChartRef} width="400" height="400" style={{ display: 'none' }}></canvas>
                )
            }
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            {/* Hidden canvases for charts */}
            {/* <canvas ref={chartRef1} width="400" height="200" style={{ display: 'none' }}></canvas>
            <canvas ref={chartRef2} width="400" height="200" style={{ display: 'none' }}></canvas> */}
        </div >
    );
}

export default App;
