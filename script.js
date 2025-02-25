let currentPage = 1; // หน้าปัจจุบัน
const itemsPerPage = 10; // จำนวนรายการต่อหน้า

document.getElementById("foodForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // รับค่าจากฟอร์ม
    const maxPriceInput = document.getElementById("maxPrice");
    const maxPrice = parseFloat(maxPriceInput.value);
    const foodType = document.getElementById("foodType").value;

    // เพิ่มการตรวจสอบ
    if (!maxPrice || maxPrice <= 0) {
        alert("กรุณาระบุราคาสูงสุดที่มากกว่า 0");
        maxPriceInput.focus();
        return;
    }

    // อ่านข้อมูลจากไฟล์ CSV
    const response = await fetch('menuData.csv'); // โหลดไฟล์ CSV
    const csvText = await response.text(); // อ่านเนื้อหาไฟล์ CSV
    const menuData = Papa.parse(csvText, { header: true }).data; // แปลง CSV เป็น JSON

    // รับค่าจากฟอร์ม
    // const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;
    // const foodType = document.getElementById("foodType").value;

    // กรองข้อมูลร้านอาหาร
    const filteredMenu = menuData.filter(item => {
        const price = item.price_level === "ต่ำกว่า 100 บาท" ? 100 : Infinity; // แปลงราคาเป็นตัวเลข
        return price <= maxPrice && (foodType === "all" || item.category_international === foodType);
    });

    // เก็บข้อมูลที่กรองไว้ในตัวแปร global เพื่อใช้ในการเปลี่ยนหน้า
    window.filteredMenu = filteredMenu;

    // แสดงผลหน้าแรก
    showPage(filteredMenu, currentPage);
});

// ฟังก์ชันแสดงผลตามหน้าที่เลือก
function showPage(data, page) {
    const start = (page - 1) * itemsPerPage;
    const end = page * itemsPerPage;
    const paginatedData = data.slice(start, end);

    let resultHtml = "<h3>ผลลัพธ์</h3>";
    if (paginatedData.length === 0) {
        resultHtml += "<p>ไม่พบร้านอาหารที่ตรงกับเงื่อนไข</p>";
    } else {
        resultHtml += `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>ชื่อร้าน</th>
                        <th>ประเภทอาหาร</th>
                        <th>ราคา</th>
                        <th>หมวดหมู่</th>
                        <th>โทรศัพท์</th>
                        <th>Email</th>
                        <th>URL</th>
                    </tr>
                </thead>
                <tbody>
        `;
        paginatedData.forEach(item => {
            resultHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.cuisine}</td>
                    <td>${item.price_level}</td>
                    <td>${item.category}</td>
                    <td>${item.phone || '-'}</td>
                    <td>${item.email || '-'}</td>
                    <td><a href="${item.url}" target="_blank"><i class="bi bi-box-arrow-up-right"></i></a></td>
                </tr>
            `;
        });
        resultHtml += "</tbody></table>";
    }

    resultHtml += createPaginationButtons(data.length);
    document.getElementById("result").innerHTML = resultHtml;

    // เพิ่มคลาส fade-in เพื่อแสดงผลลัพธ์
    document.getElementById("result").classList.add("fade-in");

    document.querySelectorAll(".pagination-btn").forEach(button => {
        button.addEventListener("click", handlePaginationClick);
    });
}

// ฟังก์ชันสร้างปุ่ม pagination
function createPaginationButtons(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let buttonsHtml = '<div class="pagination">';

    // ปุ่ม Previous
    if (currentPage > 1) {
        buttonsHtml += `<button class="pagination-btn" data-page="${currentPage - 1}">&laquo; Previous</button>`;
    }

    // แสดงปุ่มหน้าที่อยู่ใกล้ ๆ หน้าปัจจุบัน
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        buttonsHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // ปุ่ม Next
    if (currentPage < totalPages) {
        buttonsHtml += `<button class="pagination-btn" data-page="${currentPage + 1}">Next &raquo;</button>`;
    }

    buttonsHtml += '</div>';
    return buttonsHtml;
}

// จัดการคลิกปุ่ม pagination
function handlePaginationClick(e) {
    const selectedPage = parseInt(e.target.getAttribute("data-page"));
    currentPage = selectedPage;
    showPage(window.filteredMenu, currentPage);
}

document.getElementById("resetButton").addEventListener("click", function () {
    // ล้างค่าในฟอร์ม
    document.getElementById("maxPrice").value = ""; // ล้างช่องราคา
    //document.getElementById("foodType").value = "ทั้งหมด"; // รีเซ็ต dropdown เป็น "ทั้งหมด"

    // ล้างผลลัพธ์
    document.getElementById("result").innerHTML = "";

    // รีเซ็ต pagination
    currentPage = 1;

    // ลบคลาส fade-in เพื่อให้ผลลัพธ์หายไปอย่างราบรื่น
    document.getElementById("result").classList.remove("fade-in");
});
