import { generateChart } from './main.js';
import jsonData from './bquxjob_63d77ed6_18f8214db6c.json' assert { type: 'json' }

document.addEventListener('DOMContentLoaded', () => {

    
  let hasilFilter = jsonData.filter(item => item.Category === 'Water');
  const combobox = document.getElementById('tipeProduk');
  const uniqueNames = new Set(); // Gunakan Set untuk memastikan keunikan

  hasilFilter.forEach(item => {
    uniqueNames.add(item.Product);
  });
  uniqueNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    combobox.appendChild(option);
  });

    // Data untuk diagram batang (penjualan per produk)
    let totalPenjualanPerProduk = hasilFilter.reduce((total, item) => {
        if (!total[item.Product]) {
            total[item.Product] = 0;
        }
        let transTotal = parseFloat(item.TransTotal);
        if (!isNaN(transTotal)) {
            total[item.Product] += transTotal;
        }
        return total;
    }, {});
    let sortedProducts = Object.keys(totalPenjualanPerProduk).sort((a, b) => totalPenjualanPerProduk[b] - totalPenjualanPerProduk[a]);
    let labels = sortedProducts;
    let dataValues = sortedProducts.map(namaProduk => totalPenjualanPerProduk[namaProduk]);
    let ctxBar = document.getElementById('chart_divg').getContext('2d');

    // Data untuk diagram pie (penjualan per lokasi)
    let totalPenjualanPerLokasi = hasilFilter.reduce((total, item) => {
        if (!total[item.Location]) {
            total[item.Location] = 0;
        }
        let transTotal = parseFloat(item.TransTotal);
        if (!isNaN(transTotal)) {
            total[item.Location] += transTotal;
        }
        return total;
    }, {});
    let pieChartData = {
        labels: Object.keys(totalPenjualanPerLokasi),
        datasets: [{
            data: Object.values(totalPenjualanPerLokasi),
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                // tambahkan warna lain sesuai kebutuhan
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                // tambahkan warna lain sesuai kebutuhan
            ],
            borderWidth: 1
        }]
    };
    let ctxPie = document.getElementById('piechart_divg').getContext('2d');

    // Buat grafik batang
    let barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan',
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Penjualan Produk Berkategori Water (Diurutkan dari Besar ke Kecil)'
                }
            }
        }
    });

    // Buat diagram pie
    let pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: pieChartData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Penjualan per Lokasi (Kategori Water)'
                }
            }
        }
    });

    function applyFilter() {
        generateChart(ctxBar, ctxPie, hasilFilter, barChart, pieChart).then(result => {
          barChart = result.barChart;
          pieChart = result.pieChart;
        });
      }

    // Panggil fungsi saat halaman dimuat
    const greetButton = document.getElementById('generateChartButton');
    
    greetButton.addEventListener('click', applyFilter);

    const resetButton = document.getElementById('resetChartButton');
    resetButton.addEventListener('click', () => {
        resetChart(jsonData);
    });;

});
