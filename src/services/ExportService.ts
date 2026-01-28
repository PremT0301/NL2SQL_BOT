import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ExportService = {
    /**
     * Export a specific DOM element as a PNG image.
     * @param elementId The ID of the DOM element to capture.
     * @param fileName The desired file name (without extension).
     */
    exportToPng: async (elementId: string, fileName: string) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID ${elementId} not found`);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                backgroundColor: '#ffffff', // Ensure white background
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export to PNG failed:', error);
        }
    },

    /**
     * Export a specific DOM element as a PDF document.
     * @param elementId The ID of the DOM element to capture.
     * @param fileName The desired file name (without extension).
     */
    exportToPdf: async (elementId: string, fileName: string) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID ${elementId} not found`);
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height], // Match canvas dimensions
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Export to PDF failed:', error);
        }
    },
};
