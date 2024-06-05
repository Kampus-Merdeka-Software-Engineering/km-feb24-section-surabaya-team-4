export function generateChart(ctxBar, ctxPie, filteredData, existingBarChart, existingPieChart, ctxLine, existingLineChart) {
    return new Promise((resolve, reject) => {
      const quartilSelect = document.getElementById('quartilSelect');
      const tipeSelect = document.getElementById('tipeSelect');
      const combobox = document.getElementById('tipeProduk');
      const selectedProduk = combobox.value;
      const selectedTipe = tipeSelect.value;
  
      // Hancurkan grafik yang ada jika ada
      if (existingBarChart) {
        existingBarChart.destroy();
      }
      if (existingPieChart) {
        existingPieChart.destroy();
      }
      if (existingLineChart) {
        existingLineChart.destroy();
    }
  
      const selectedQuartil = quartilSelect.value;
      const quartilRanges = {
        'Q1': { start: new Date('2022-01-01'), end: new Date('2022-03-31') },
        'Q2': { start: new Date('2022-04-01'), end: new Date('2022-06-30') },
        'Q3': { start: new Date('2022-07-01'), end: new Date('2022-09-30') },
        'Q4': { start: new Date('2022-10-01'), end: new Date('2022-12-31') }
      };
  
      const selectedRange = selectedQuartil !== 'Semua' ? quartilRanges[selectedQuartil] : null;
      const startDate = selectedRange?.start;
      const endDate = selectedRange?.end;
  
      const filteredData1 = filteredData.filter(item => {
        const itemDate = new Date(item.TransDate);
        return (
          (selectedQuartil === 'Semua' || (itemDate >= startDate && itemDate <= endDate)) &&
          (selectedTipe === 'Semua' || item.Type === selectedTipe) &&
          (selectedProduk === 'Semua' || item.Product === selectedProduk)
        );
      });
  
      console.log("Filtered Data:", filteredData1);
  
    //   if (filteredData1.length === 0) {
    //     console.log("Tidak ada data yang ditemukan untuk rentang waktu dan kategori yang dipilih.");
        
    //     // Draw "Data is not available" message on bar chart canvas
    //     const ctxBarCanvas = ctxBar.getContext('2d');
    //     ctxBarCanvas.clearRect(0, 0, ctxBar.width, ctxBar.height);
    //     ctxBarCanvas.textAlign = 'center';
    //     ctxBarCanvas.textBaseline = 'middle';
    //     ctxBarCanvas.font = '20px Arial';
    //     ctxBarCanvas.fillText('Data is not available', ctxBar.width / 2, ctxBar.height / 2);
        
    //     // Draw "Data is not available" message on pie chart canvas
    //     const ctxPieCanvas = ctxPie.getContext('2d');
    //     ctxPieCanvas.clearRect(0, 0, ctxPie.width, ctxPie.height);
    //     ctxPieCanvas.textAlign = 'center';
    //     ctxPieCanvas.textBaseline = 'middle';
    //     ctxPieCanvas.font = '20px Arial';
    //     ctxPieCanvas.fillText('Data is not available', ctxPie.width / 2, ctxPie.height / 2);
  
    //     resolve({ barChart: null, pieChart: null });
    //     return;
    //   }
  
      const totalPenjualanPerProduk = {};
      const totalPenjualanPerLokasi = {};
  
      filteredData1.forEach(item => {
        const product = item.Product;
        const location = item.Location;
        const transTotal = parseFloat(item.TransTotal);
  
        if (!isNaN(transTotal)) {
          totalPenjualanPerProduk[product] = (totalPenjualanPerProduk[product] || 0) + transTotal;
          totalPenjualanPerLokasi[location] = (totalPenjualanPerLokasi[location] || 0) + transTotal;
        }
      });
  
      const sortedProducts = Object.keys(totalPenjualanPerProduk).sort(
        (a, b) => totalPenjualanPerProduk[b] - totalPenjualanPerProduk[a]
      );
  
      const barChartData = {
        labels: sortedProducts,
        datasets: [{
          label: 'Penjualan',
          data: sortedProducts.map(product => totalPenjualanPerProduk[product]),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
  
      const pieChartData = {
        labels: Object.keys(totalPenjualanPerLokasi),
        datasets: [{
          data: Object.values(totalPenjualanPerLokasi),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            // ... (tambahkan warna lain sesuai kebutuhan)
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            // ... (tambahkan warna lain sesuai kebutuhan)
          ],
          borderWidth: 1
        }]
      };
  
      const barChartOptions = {
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
      };
  
      const pieChartOptions = {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Total Penjualan per Lokasi (Kategori Water)'
          }
        }
      };
  
      const newBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: barChartData,
        options: barChartOptions
      });
  
      const newPieChart = new Chart(ctxPie, {
        type: 'pie',
        data: pieChartData,
        options: pieChartOptions
      });
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
   
      // Update data untuk line chart
      const totalPenjualanPerTokoPerBulan = filteredData1.reduce((total, item) => {
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

    let totalTransaksiKeseluruhan = 0;
    filteredData1.forEach(item => {
      const transTotal = parseFloat(item.RQty);
      if (!isNaN(transTotal)) {
        totalTransaksiKeseluruhan += transTotal;
      }
    });

    
    let totalRevenue = 0;
    filteredData1.forEach(item => {
      const transTotal = parseFloat(item.LineTotal);
      if (!isNaN(transTotal)) {
        totalRevenue += transTotal;
      }
    });

    console.log(totalRevenue);


    document.getElementById('total_revenue').innerText = `$${totalRevenue.toLocaleString()}`;
    document.getElementById('total_sales').innerText = `${totalTransaksiKeseluruhan.toLocaleString()}`;

    // Ambil semua bulan dan toko yang unik dari filteredLineData
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

    // Buat line chart baru
    const newLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: bulanSorted.map(bulan => {
                const [, bulanAngka] = bulan.split('-');
                return namaBulan[parseInt(bulanAngka, 10) - 1]; 
            }),
            datasets: Array.from(tokoSet).map(toko => ({
                label: toko,
                data: bulanSorted.map(bulan => totalPenjualanPerTokoPerBulan[bulan]?.[toko] ?? 0), 
                borderColor: getRandomColor(), 
                fill: false,
            })),
        },
        options: {
            // ... (opsi line chart lainnya) ...
        },
        });

            resolve({ barChart: newBarChart, pieChart: newPieChart, lineChart: newLineChart });

    });
    
    
  }
  

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

