// متغيرات عامة
let products = [];
let currentProduct = null;
const WHATSAPP_NUMBER = '201278553922'; // رقم الواتس

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupEventListeners();
});

// تحميل المنتجات من JSON
async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    products = await response.json();
    displayProducts();
  } catch (error) {
    console.error('خطأ في تحميل المنتجات:', error);
    document.getElementById('gallery').innerHTML = '<div class="empty-message">حدث خطأ في تحميل المنتجات</div>';
  }
}

// عرض المنتجات في الجاليري
function displayProducts() {
  const gallery = document.getElementById('gallery');
  
  if (products.length === 0) {
    gallery.innerHTML = '<div class="empty-message">لا توجد منتجات حالياً</div>';
    return;
  }

  gallery.innerHTML = products.map(product => `
    <div class="product-card" onclick="openProductDetail(${product.id})">
      <img src="${product.images[0]}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-price">${product.price} ر.ع</div>
        <button class="btn-whatsapp" onclick="sendWhatsApp(event, ${product.id})">
          📱 تواصل عبر WhatsApp
        </button>
      </div>
    </div>
  `).join('');
}

// إرسال رسالة WhatsApp
function sendWhatsApp(event, productId) {
  event.stopPropagation(); // منع فتح التفاصيل
  
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const message = `مرحباً! 👋\n\nأنا مهتم بالمنتج:\n*${product.name}*\n\n💰 السعر: ${product.price} ر.ع\n📝 الوصف: ${product.description}\n\nهل يمكنك مساعدتي بمزيد من المعلومات؟`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  window.open(whatsappURL, '_blank');
}

// فتح تفاصيل المنتج
function openProductDetail(productId) {
  currentProduct = products.find(p => p.id === productId);
  
  if (!currentProduct) return;

  const modal = document.getElementById('productModal');
  const modalBody = document.getElementById('modalBody');

  const imagesHTML = currentProduct.images.map(img => 
    `<img src="${img}" alt="${currentProduct.name}">`
  ).join('');

  modalBody.innerHTML = `
    <div class="product-detail-images">
      ${imagesHTML}
    </div>
    <div class="product-detail-info">
      <div class="product-detail-name">${currentProduct.name}</div>
      <div class="product-detail-price">${currentProduct.price} ر.ع</div>
      <div class="product-detail-description">${currentProduct.description}</div>
      <button class="btn-whatsapp-large" onclick="sendWhatsApp(event, ${currentProduct.id})">
        📱 تواصل عبر WhatsApp الآن
      </button>
    </div>
  `;

  modal.classList.add('active');
}

// إغلاق المودال
function closeModal() {
  document.getElementById('productModal').classList.remove('active');
  currentProduct = null;
}

// إعداد المستمعين للأحداث
function setupEventListeners() {
  const modal = document.getElementById('productModal');
  
  // إغلاق عند الضغط على زر الإغلاق
  document.querySelector('.close-btn').addEventListener('click', closeModal);
  
  // إغلاق عند الضغط خارج المودال
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // إغلاق بزر ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}
