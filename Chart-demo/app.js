import { generateChart } from './main.js';
import { resetChart } from './main.js'; // Mengimpor resetChart dari main.js
import jsonData from './bquxjob_63d77ed6_18f8214db6c.json' assert { type: 'json' }

document.addEventListener('DOMContentLoaded', () => {
    let hasilFilter = jsonData.filter(item => item.Category === 'Water');
    let totalPenjualanPerProduk = hasilFilter.reduce((total, item) => {
        if (!total[item.Product]) {
            total[item.Product] = 0;
        }
        total[item.Product] += parseFloat(item.TransTotal);
        return total;
    }, {});

    // Urutkan data dari besar ke kecil
    let sortedProducts = Object.keys(totalPenjualanPerProduk).sort((a, b) => totalPenjualanPerProduk[b] - totalPenjualanPerProduk[a]);

    // Buat array data untuk Google Charts
    let googleChartData = [['Produk', 'Penjualan']];
    sortedProducts.forEach(namaProduk => {
        googleChartData.push([namaProduk, totalPenjualanPerProduk[namaProduk]]);
    });

    // Muat library Google Charts
    google.charts.load('current', {'packages':['corechart']});

    // Set fungsi untuk menggambar grafik
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        // Buat objek data Google
        let data = google.visualization.arrayToDataTable(googleChartData);

        // Set opsi untuk grafik
        let options = {
            title: 'Penjualan Produk Berkategori Non Carbonated (Diurutkan dari Besar ke Kecil)',
            hAxis: {title: 'Produk'},
            vAxis: {title: 'Penjualan'}
        };

        // Buat grafik baru dan gambar di div dengan id 'chart_div'
        let chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
    
    // Panggil fungsi saat halaman dimuat
    const greetButton = document.getElementById('generateChartButton');
    greetButton.addEventListener('click', () => {
        generateChart(jsonData);
    });;

    const resetButton = document.getElementById('resetChartButton');
    resetButton.addEventListener('click', () => {
        resetChart(jsonData);
    });;

});
