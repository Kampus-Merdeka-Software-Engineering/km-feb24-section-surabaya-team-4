import { generateChart } from './main.js';
import jsonData from './bquxjob_63d77ed6_18f8214db6c.json' assert { type: 'json' }

document.addEventListener('DOMContentLoaded', () => {

    // Ensure the canvas elements exist
    let canvasBar = document.getElementById('chart_divg');
    let canvasPie = document.getElementById('piechart_divg');
    let canvasLine = document.getElementById('linechart_divg');
    let ctxLine = canvasLine.getContext('2d');


    if (!canvasBar || !canvasPie) {
        console.error('Canvas elemenctts not found.');
        return;
    }

    // Ensure the contexts are valid
    let ctxBar = canvasBar.getContext('2d');
    let ctxPie = canvasPie.getContext('2d');

    if (!ctxBar || !ctxPie) {
        console.error('Failed to get canvas context.');
        return;
    }

    let hasilFilter = jsonData.filter(item => item.Category === 'Water');
    const combobox = document.getElementById('tipeProduk');
    const uniqueNames = new Set();

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

    

    
     // Prepare data for the line chart (penjualan per produk per bulan di setiap lokasi)
     let totalPenjualanPerTokoPerBulan = hasilFilter.reduce((total, item) => {
        const tahun = item.TransDate.slice(0, 4);
        const bulan = item.TransDate.slice(5, 7);
        const waktu = `${tahun}-${bulan}`;
        const toko = item.Location;
    
        if (!total[waktu]) {
          total[waktu] = {};
        }
        if (!total[waktu][toko]) {
          total[waktu][toko] = 0;
        }
        total[waktu][toko] += parseFloat(item.TransTotal);
    
        return total;
      }, {});
    
      // Ambil semua bulan dan toko yang unik
      const bulanSet = new Set();
      const tokoSet = new Set();
      for (const waktu in totalPenjualanPerTokoPerBulan) {
        bulanSet.add(waktu);
        for (const toko in totalPenjualanPerTokoPerBulan[waktu]) {
          tokoSet.add(toko);
        }
      }
    
      // Urutkan bulan-bulan
      const bulanSorted = Array.from(bulanSet).sort((a, b) => {
        const [tahunA, bulanA] = a.split('-').map(Number);
        const [tahunB, bulanB] = b.split('-').map(Number);
        return tahunA * 12 + bulanA - (tahunB * 12 + bulanB);
      });
    
      // Buat dataset untuk setiap toko
      const datasets = Array.from(tokoSet).map(toko => ({
        label: toko,
        data: bulanSorted.map(bulan => totalPenjualanPerTokoPerBulan[bulan]?.[toko] || 0), // Jika tidak ada data, isi dengan 0
        borderColor: getRandomColor(),
        fill: false,
      }));
    
      // Nama-nama bulan
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
      // Buat grafik garis
        let lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: bulanSorted.map(bulan => {
            const [, bulanAngka] = bulan.split('-');
            return namaBulan[parseInt(bulanAngka, 10) - 1]; // Gunakan nama bulan
          }),
          datasets: datasets,
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Total Penjualan per Lokasi per Bulan (Kategori Water)',
            },
          },
        },
      });
    
  

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function applyFilter() {
     // Hancurkan line chart yang sudah ada jika ada
   
    generateChart(ctxBar, ctxPie, hasilFilter, barChart, pieChart, ctxLine, lineChart).then(result => {
      barChart = result.barChart;
      pieChart = result.pieChart;
      lineChart = result.lineChart;
    });
}
    // Panggil fungsi saat halaman dimuat
    const greetButton = document.getElementById('generateChartButton');
    greetButton.addEventListener('click', applyFilter);

    const resetButton = document.getElementById('resetChartButton');
    resetButton.addEventListener('click', () => {
        resetChart(jsonData);
    });
});
