export function generateChart(jsonData) {
    const quartilSelect = document.getElementById('quartilSelect');
    const tipeSelect = document.getElementById('tipeSelect');
    const selectedTipe = tipeSelect.value;

    const selectedQuartil = quartilSelect.value;
    const quartilRanges = {
        'Q1': { start: new Date('2022-01-01'), end: new Date('2022-03-31') },
        'Q2': { start: new Date('2022-04-01'), end: new Date('2022-06-30') },
        'Q3': { start: new Date('2022-07-01'), end: new Date('2022-09-30') },
        'Q4': { start: new Date('2022-10-01'), end: new Date('2022-12-31') }
    };

    // Check if the selected quartile is valid

    
    const selectedRange = selectedQuartil !== 'Semua' ? quartilRanges[selectedQuartil] : null;
    const startDate = selectedRange?.start;
    const endDate = selectedRange?.end;
   // Filter data berdasarkan kategori "Water"
const filteredData = jsonData.filter(item => {
    const itemDate = new Date(item.TransDate);
   return ( selectedQuartil === 'Semua' || itemDate >= startDate && itemDate <= endDate) && item.Category === 'Water' && (selectedTipe === 'Semua' || item.Type === selectedTipe); // Sesuaikan dengan kategori yang benar
});


    console.log("Filtered Data:", filteredData);

    if (filteredData.length === 0) {
        console.log("Tidak ada data yang ditemukan untuk rentang waktu dan kategori yang dipilih.");
        return;
    }

    // Hitung total penjualan per produk
    let totalPenjualanPerProduk = filteredData.reduce((total, item) => {
        if (!total[item.Product]) {
            total[item.Product] = 0;
        }
        total[item.Product] += parseFloat(item.TransTotal);
        return total;
    }, {});

    console.log("Total Penjualan Per Produk:", totalPenjualanPerProduk);

    // Urutkan produk berdasarkan total penjualan
    let sortedProducts = Object.keys(totalPenjualanPerProduk).sort((a, b) => totalPenjualanPerProduk[b] - totalPenjualanPerProduk[a]);

    // Buat array data untuk Google Charts
    let googleChartData = [['Produk', 'Penjualan']];
    sortedProducts.forEach(namaProduk => {
        googleChartData.push([namaProduk, totalPenjualanPerProduk[namaProduk]]);
    });

    console.log("Google Chart Data:", googleChartData);

    // Muat library Google Charts
    google.charts.load('current', {'packages':['corechart']});

    // Set fungsi untuk menggambar grafik
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        // Buat objek data Google
        let data = google.visualization.arrayToDataTable(googleChartData);

        // Set opsi untuk grafik
        let options = {
            title: 'Penjualan Produk Berkategori Water (Diurutkan dari Besar ke Kecil)',
            hAxis: { title: 'Produk' },
            vAxis: { title: 'Penjualan' }
        };

        // Buat grafik baru dan gambar di div dengan id 'chart_div'
        let chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
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

