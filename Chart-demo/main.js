export function generateChart(ctxBar, ctxPie, filteredData, existingBarChart, existingPieChart) {
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

    if (filteredData1.length === 0) {
      console.log("Tidak ada data yang ditemukan untuk rentang waktu dan kategori yang dipilih.");
      
      // Draw "Data is not available" message on bar chart canvas
      const ctxBarCanvas = ctxBar.getContext('2d');
      ctxBarCanvas.clearRect(0, 0, ctxBar.width, ctxBar.height);
      ctxBarCanvas.textAlign = 'center';
      ctxBarCanvas.textBaseline = 'middle';
      ctxBarCanvas.font = '20px Arial';
      ctxBarCanvas.fillText('Data is not available', ctxBar.width / 2, ctxBar.height / 2);
      
      // Draw "Data is not available" message on pie chart canvas
      const ctxPieCanvas = ctxPie.getContext('2d');
      ctxPieCanvas.clearRect(0, 0, ctxPie.width, ctxPie.height);
      ctxPieCanvas.textAlign = 'center';
      ctxPieCanvas.textBaseline = 'middle';
      ctxPieCanvas.font = '20px Arial';
      ctxPieCanvas.fillText('Data is not available', ctxPie.width / 2, ctxPie.height / 2);

      resolve({ barChart: null, pieChart: null });
      return;
    }

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

    resolve({ barChart: newBarChart, pieChart: newPieChart });
  });
}

  
export function resetChart(jsonData) {
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

    const quartilSelect = document.getElementById('quartilSelect');
            quartilSelect.value = ''; // Set nilai combo box ke kosong (nilai awal)
}

