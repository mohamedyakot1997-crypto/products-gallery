// متغيرات لوحة التحكم
let products = [];
let editingProductId = null;
const CORRECT_PASSWORD = '12345'; // كلمة المرور

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  checkPassword();
});

// التحقق من كلمة المرور
function checkPassword() {
  const passwordInput = prompt('🔐 أدخل كلمة المرور للوصول إلى لوحة التحكم:\n(استخدم أرقام فقط من 1-5)');
  
  if (passwordInput === CORRECT_PASSWORD) {
    loadProducts();
    setupEventListeners();
  } else {
    alert('❌ كلمة المرور خاطئة!');
    window.location.href = 'index.html';
  }
}

// تحميل المنتجات
async function loadProducts() {
  try {
    // محاولة تحميل من LocalStorage أولاً
    const saved = localStorage.getItem('products');
    if (saved) {
      products = JSON.parse(saved);
    } else {
      // إذا لم توجد بيانات محفوظة، تحميل من JSON
      const response = await fetch('data/products.json');
      products = await response.json();
    }
    displayProductsTable();
  } catch (error) {
    console.error('خطأ في تحميل المنتجات:', error);
    alert('خطأ في تحميل المنتجات');
  }
}

// عرض المنتجات في جدول
function displayProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">لا توجد منتجات</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>${product.images.length} صورة</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-primary" onclick="editProduct(${product.id})">تعديل</button>
          <button class="btn btn-danger" onclick="deleteProduct(${product.id})">حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// إعادة تعيين النموذج
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
  editingProductId = null;
  document.getElementById('submitBtn').textContent = 'إضافة منتج';
  document.getElementById('cancelBtn').style.display = 'none';
}

// إضافة منتج جديد
function addProduct(e) {
  e.preventDefault();
  
  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const imageUrls = document.getElementById('imageUrls').value.trim().split('\n').filter(url => url.trim());

  if (!name || !description || !price || imageUrls.length === 0) {
    alert('الرجاء ملء جميع الحقول');
    return;
  }

  if (editingProductId) {
    // تعديل منتج موجود
    const productIndex = products.findIndex(p => p.id === editingProductId);
    if (productIndex !== -1) {
      products[productIndex] = {
        id: editingProductId,
        name,
        description,
        price,
        images: imageUrls
      };
    }
  } else {
    // إضافة منتج جديد
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({
      id: newId,
      name,
      description,
      price,
      images: imageUrls
    });
  }

  saveProducts();
  displayProductsTable();
  resetForm();
  alert(editingProductId ? 'تم تحديث المنتج بنجاح! ✅' : 'تم إضافة المنتج بنجاح! ✅');
}

// تعديل منتج
function editProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  editingProductId = productId;
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('imageUrls').value = product.images.join('\n');
  
  displayImagePreview(product.images);
  
  document.getElementById('submitBtn').textContent = 'تحديث المنتج';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  
  // التمرير للأعلى
  document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
}

// حذف منتج
function deleteProduct(productId) {
  if (confirm('⚠️ هل أنت متأكد من حذف هذا المنتج؟')) {
    products = products.filter(p => p.id !== productId);
    saveProducts();
    displayProductsTable();
    alert('تم حذف المنتج بنجاح! ✅');
  }
}

// حفظ البيانات (محلياً)
function saveProducts() {
  // حفظ في LocalStorage
  localStorage.setItem('products', JSON.stringify(products));
  console.log('تم حفظ المنتجات:', products);
}

// عرض معاينة الصور
function displayImagePreview(images) {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = images.map((img, index) => `
    <div class="image-preview-item">
      <img src="${img}" alt="صورة ${index + 1}" onerror="this.src='https://via.placeholder.com/150?text=Error'">
      <button type="button" class="btn btn-danger" onclick="removeImage(${index})">حذف</button>
    </div>
  `).join('');
}

// حذف صورة
function removeImage(index) {
  const imageUrls = document.getElementById('imageUrls').value.trim().split('\n');
  imageUrls.splice(index, 1);
  document.getElementById('imageUrls').value = imageUrls.join('\n');
  displayImagePreview(imageUrls);
}

// تحديث المعاينة عند كتابة روابط الصور
function setupEventListeners() {
  const imageUrls = document.getElementById('imageUrls');
  if (imageUrls) {
    imageUrls.addEventListener('change', () => {
      const urls = imageUrls.value.trim().split('\n').filter(url => url.trim());
      displayImagePreview(urls);
    });
  }
  
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
}

// إعادة تعيين البيانات
function resetToDefault() {
  if (confirm('⚠️ هل تريد إعادة تعيين البيانات للقيم الافتراضية؟')) {
    fetch('data/products.json')
      .then(response => response.json())
      .then(data => {
        products = data;
        saveProducts();
        displayProductsTable();
        alert('تم إعادة تعيين البيانات! ✅');
      });
  }
}
