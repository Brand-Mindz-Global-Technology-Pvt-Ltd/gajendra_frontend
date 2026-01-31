/**
 * Product Module Utilities
 */

/**
 * Create product image gallery HTML
 */
function createProductGallery(images, productId) {
  console.log("Creating gallery for product:", productId, "Images:", images);

  if (!images || images.length === 0) {
    console.log("No images found for product:", productId);
    return `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                <i class="fas fa-image text-muted"></i>
              </div>`;
  }

  if (images.length === 1) {
    const imageUrl = `${PRODUCT_CONSTANTS.IMAGE_UPLOAD_PATH}${images[0]}`;
    console.log("Single image URL:", imageUrl);
    return `<div class="single-image-container" onclick="openImageModal(${productId}, 0)">
                <img src="${imageUrl}" 
                     class="single-product-image" 
                     alt="Product Image"
                     onload="console.log('Image loaded successfully:', this.src)"
                     onerror="console.log('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="image-error-fallback" style="display: none;">
                  <i class="fas fa-image"></i>
                </div>
              </div>`;
  }

  const maxDisplay = 4;
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  let galleryHTML = '<div class="product-gallery">';

  displayImages.forEach((image, index) => {
    const imageUrl = `${PRODUCT_CONSTANTS.IMAGE_UPLOAD_PATH}${image}`;
    galleryHTML += `
        <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${index})">
          <img src="${imageUrl}" alt="Product Image ${index + 1}">
          <div class="gallery-overlay">
            <i class="fas fa-search-plus"></i>
          </div>
        </div>
      `;
  });

  if (remainingCount > 0) {
    galleryHTML += `
        <div class="gallery-thumbnail" onclick="openImageModal(${productId}, ${maxDisplay})">
          <div class="bg-light d-flex align-items-center justify-content-center" style="height: 100%;">
            <span class="text-muted">+${remainingCount}</span>
          </div>
          <div class="gallery-count">${images.length}</div>
        </div>
      `;
  }

  galleryHTML += "</div>";
  return galleryHTML;
}

/**
 * Initialize price variations functionality
 */
function initializePriceVariations() {
  const addVariationBtn = document.getElementById('addVariation');
  if (addVariationBtn) {
    // Remove existing listener to prevent duplicates if called multiple times
    addVariationBtn.removeEventListener('click', addPriceVariation);
    addVariationBtn.addEventListener('click', addPriceVariation);
  }

  // Use event delegation for remove buttons, attached to document only once if possible
  // But here we'll just attach it safely. 
  // Note: In a modular setup, we might want to attach this only when the form is present.
  // For now, we keep the global delegation but ensure it doesn't conflict.
  if (!window.variationDeleteListenerAttached) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('.remove-variation')) {
        e.target.closest('.variation-row').remove();
      }
    });
    window.variationDeleteListenerAttached = true;
  }
}

/**
 * Add new price variation row
 */
function addPriceVariation() {
  const variationsContainer = document.getElementById('priceVariations');
  const newRow = document.createElement('div');
  newRow.className = 'variation-row row g-2 mb-2';
  newRow.innerHTML = `
      <div class="col-md-3">
        <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g">
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0">
      </div>
      <div class="col-md-3">
        <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0">
      </div>
      <div class="col-md-3">
        <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  variationsContainer.appendChild(newRow);
}

/**
 * Collect all price variations from the form
 */
function collectPriceVariations() {
  const variations = [];
  const variationRows = document.querySelectorAll('.variation-row');

  console.log('Collecting variations from', variationRows.length, 'rows');

  variationRows.forEach((row, index) => {
    const quantityInput = row.querySelector('.variation-quantity');
    const priceInput = row.querySelector('.variation-price');
    const strikePriceInput = row.querySelector('.variation-strike-price');

    if (!quantityInput || !priceInput) {
      console.log('Missing required inputs in row', index);
      return;
    }

    const quantity = quantityInput.value.trim();
    const price = parseFloat(priceInput.value);
    const strikePrice = strikePriceInput ? parseFloat(strikePriceInput.value) : null;

    console.log('Row', index, ':', { quantity, price, strikePrice });

    if (quantity && !isNaN(price) && price > 0) {
      const variation = {
        quantity: quantity,
        amount: price
      };

      if (strikePrice && !isNaN(strikePrice) && strikePrice > 0) {
        variation.strike_amount = strikePrice;
      }

      variations.push(variation);
      console.log('Added variation:', variation);
    } else {
      console.log('Skipping row', index, 'due to invalid data');
    }
  });

  console.log('Final variations array:', variations);
  return variations;
}

/**
 * Reset price variations to default state
 */
function resetPriceVariations() {
  const variationsContainer = document.getElementById('priceVariations');
  variationsContainer.innerHTML = `
      <div class="variation-row row g-2 mb-2">
        <div class="col-md-3">
          <input type="text" class="form-control variation-quantity" placeholder="e.g., 500g">
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control variation-price" placeholder="Price" step="0.01" min="0">
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control variation-strike-price" placeholder="Strike Price" step="0.01" min="0">
        </div>
        <div class="col-md-3">
          <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
}

/**
 * Load price variations for editing
 */
function loadPriceVariations(variations) {
  if (typeof variations === 'string') {
    try {
      variations = JSON.parse(variations);
    } catch (e) {
      console.error("Failed to parse variations string:", e);
      resetPriceVariations();
      return;
    }
  }

  if (!variations || !Array.isArray(variations) || variations.length === 0) {
    resetPriceVariations();
    return;
  }

  const variationsContainer = document.getElementById('priceVariations');
  variationsContainer.innerHTML = '';

  variations.forEach((variation, index) => {
    const newRow = document.createElement('div');
    newRow.className = 'variation-row row g-2 mb-2';
    newRow.innerHTML = `
          <div class="col-md-3">
            <input type="text" class="form-control variation-quantity" value="${variation.quantity || ''}" placeholder="e.g., 500g">
          </div>
          <div class="col-md-3">
            <input type="number" class="form-control variation-price" value="${variation.amount || ''}" placeholder="Price" step="0.01" min="0">
          </div>
          <div class="col-md-3">
            <input type="number" class="form-control variation-strike-price" value="${variation.strike_amount || ''}" placeholder="Strike Price" step="0.01" min="0">
          </div>
          <div class="col-md-3">
            <button type="button" class="btn btn-outline-danger btn-sm remove-variation">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
    variationsContainer.appendChild(newRow);
  });
}

/**
 * Get image files from upload slots
 */
function getImageFiles() {
  const slots = document.querySelectorAll(".image-upload-slot");
  const files = [null, null, null, null];

  slots.forEach((slot, index) => {
    const input = slot.querySelector(".image-input");

    const isDeleted = slot.classList.contains("deleted-slot");
    if (isDeleted) {
      // send empty for delete
      files[index] = null;
      return;
    }

    if (input && input.files && input.files[0]) {
      // user uploaded a new file
      files[index] = input.files[0];
    } else {
      // no upload → keep NULL (backend keeps old image)
      files[index] = null;
    }
  });

  return files;
}

/**
 * Get delete flags from upload slots
 */
function getDeleteFlags() {
  const slots = document.querySelectorAll(".image-upload-slot");
  return Array.from(slots).map(slot =>
    slot.classList.contains("deleted-slot") ? "1" : "0"
  );
}

/**
 * Utility: Wait until a <select> contains an option with given value
 */
function waitForOption(selectEl, value) {
  return new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 40; // 1 second (40 * 25ms)

    const check = () => {
      attempts++;
      const found = Array.from(selectEl.options).some(opt => opt.value === value);

      if (found) {
        resolve(true);
      } else if (attempts >= maxAttempts) {
        console.warn(`⚠️ Option ${value} not found in select after timeout`);
        resolve(false); // Resolve false instead of hanging
      } else {
        setTimeout(check, 25);
      }
    };
    check();
  });
}

/**
 * Load subcategories for product form (internal function)
 */
async function loadSubcategoriesForProduct(categoryId) {
  const subcatSelect = document.getElementById("prodSubcategory");

  subcatSelect.innerHTML = '<option value="">Select Subcategory</option>';

  if (!categoryId) {
    subcatSelect.removeAttribute('required');
    return;
  }

  try {
    console.log(`🔍 Loading subcategories for category: ${categoryId}, shop: ${currentShop.id}`);

    const response = await fetch(
      `${API_BASE}/get_subcategories.php?shop_id=${currentShop.id}&category_id=${categoryId}`
    );

    const data = await response.json();
    console.log('📦 Subcategories response:', data);

    if (data.success && data.subcategories.length > 0) {
      data.subcategories.forEach((sub) => {
        subcatSelect.innerHTML += `
            <option value="${sub.id}">${sub.name}</option>
          `;
      });
      subcatSelect.setAttribute('required', 'required');
      console.log(`✅ Loaded ${data.subcategories.length} subcategories`);
    } else {
      subcatSelect.innerHTML = `<option value="">No subcategories found</option>`;
      subcatSelect.removeAttribute('required');
      console.log('⚠️ No subcategories found for this category');
    }

  } catch (error) {
    console.error("❌ Failed to load subcategories:", error);
    subcatSelect.innerHTML = `<option value="">Failed to load</option>`;
    subcatSelect.removeAttribute('required');
  }
}

// Export functions to global scope
window.createProductGallery = createProductGallery;
window.initializePriceVariations = initializePriceVariations;
window.addPriceVariation = addPriceVariation;
window.collectPriceVariations = collectPriceVariations;
window.resetPriceVariations = resetPriceVariations;
window.loadPriceVariations = loadPriceVariations;
window.getImageFiles = getImageFiles;
window.getDeleteFlags = getDeleteFlags;
window.waitForOption = waitForOption;
window.loadSubcategoriesForProduct = loadSubcategoriesForProduct;

/**
 * Initialize image upload slots
 */
/**
 * Initialize image upload slots
 */
function initializeImageUploadSlots() {
  const container = document.getElementById('imageUploadSlots');
  if (!container) return;

  // 1. GENERATE SLOTS (if needed)
  if (container.children.length === 0 || container.innerHTML.includes('<!--')) {
    console.log('🖼️ Generating image upload slots...');
    container.innerHTML = '';

    for (let i = 0; i < 4; i++) {
      container.innerHTML += `
            <div class="col-6 col-md-3">
                <div class="image-upload-slot" data-slot="${i}">
                    <div class="image-preview-container">
                        <img src="" class="image-preview" alt="Preview" style="display:none;">
                        <div class="image-placeholder">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Upload Image</span>
                        </div>
                    </div>
                    <div class="image-actions">
                        <button type="button" class="btn btn-danger btn-sm remove-image" style="display:none;" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                        <button type="button" class="btn btn-warning btn-sm undo-delete" style="display:none;" title="Undo">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                    <input type="file" class="image-input" accept="image/*" style="display:none">
                </div>
            </div>
          `;
    }
  }

  // 2. SETUP LISTENERS (ONLY ONCE using delegation)
  if (container.dataset.initialized === 'true') {
    console.log('✅ Image upload listeners already active');
    return;
  }

  console.log('🔌 Attaching image upload delegated listeners...');

  // Use event delegation for click interactions
  container.addEventListener('click', function (e) {
    const slot = e.target.closest('.image-upload-slot');
    if (!slot) return;

    const input = slot.querySelector('.image-input');
    const removeBtn = e.target.closest('.remove-image');
    const undoBtn = e.target.closest('.undo-delete');

    if (removeBtn) {
      e.stopPropagation();
      input.value = '';
      const preview = slot.querySelector('.image-preview');
      const placeholder = slot.querySelector('.image-placeholder');
      preview.src = '';
      preview.style.display = 'none';
      if (placeholder) placeholder.style.display = 'flex';
      slot.classList.remove('has-image');
      slot.classList.add('deleted-slot');
      removeBtn.style.display = 'none';
      return;
    }

    if (undoBtn) {
      e.stopPropagation();
      slot.classList.remove('deleted-slot');
      const preview = slot.querySelector('.image-preview');
      const placeholder = slot.querySelector('.image-placeholder');
      const rBtn = slot.querySelector('.remove-image');
      if (preview.src && preview.src !== '') {
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        slot.classList.add('has-image');
        if (rBtn) rBtn.style.display = 'block';
        undoBtn.style.display = 'none';
      }
      return;
    }

    // Default: Click anywhere else on slot triggers input
    if (input) input.click();
  });

  // Since 'change' doesn't bubble in some old browsers (but works in most modern ones), 
  // we'll listen for it on the container.
  container.addEventListener('change', function (e) {
    if (e.target.classList.contains('image-input')) {
      const input = e.target;
      const slot = input.closest('.image-upload-slot');
      const preview = slot.querySelector('.image-preview');
      const placeholder = slot.querySelector('.image-placeholder');
      const removeBtn = slot.querySelector('.remove-image');
      const undoBtn = slot.querySelector('.undo-delete');

      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (re) {
          preview.src = re.target.result;
          preview.style.display = 'block';
          if (placeholder) placeholder.style.display = 'none';
          slot.classList.add('has-image');
          slot.classList.remove('deleted-slot');
          if (removeBtn) removeBtn.style.display = 'block';
          if (undoBtn) undoBtn.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
  });

  container.dataset.initialized = 'true';
  console.log('✅ Image upload delegation active');
}

window.initializeImageUploadSlots = initializeImageUploadSlots;


/**
 * Load images into upload slots for editing
 */
function loadImagesForEdit(images) {
  console.log('🖼️ Loading images for edit:', images);

  // First, ensure slots are generated
  initializeImageUploadSlots();

  const slots = document.querySelectorAll('.image-upload-slot');

  // Reset all slots first
  slots.forEach(slot => {
    const input = slot.querySelector('.image-input');
    const preview = slot.querySelector('.image-preview');
    const placeholder = slot.querySelector('.image-placeholder');
    const removeBtn = slot.querySelector('.remove-image');
    const undoBtn = slot.querySelector('.undo-delete');

    input.value = '';
    preview.src = '';
    preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';

    slot.classList.remove('has-image', 'deleted-slot');
    if (removeBtn) removeBtn.style.display = 'none';
    if (undoBtn) undoBtn.style.display = 'none';
  });

  // Populate with existing images
  images.forEach((image, index) => {
    if (index >= 4) return;

    const slot = slots[index];
    if (!slot) return;

    const preview = slot.querySelector('.image-preview');
    const placeholder = slot.querySelector('.image-placeholder');
    const removeBtn = slot.querySelector('.remove-image');

    if (image && image !== '__EMPTY__') {
      const imageUrl = `${PRODUCT_CONSTANTS.IMAGE_UPLOAD_PATH}${image}`;
      preview.src = imageUrl;
      preview.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';

      slot.classList.add('has-image');
      if (removeBtn) removeBtn.style.display = 'block';
    }
  });
}

window.loadImagesForEdit = loadImagesForEdit;

/**
 * Load Taste Segments for editing
 */
function loadTasteSegments(segments) {
  const container = document.getElementById("howToUseSegments");
  if (!container) return;

  // Clear existing segments
  container.innerHTML = '';

  // Ensure segments is an array
  const existingSegments = Array.isArray(segments) ? segments : [];

  // Add existing segments
  existingSegments.forEach((seg) => {
    addTasteSegment(seg);
  });

  // Fill up to 4 segments
  const countToAdd = 4 - existingSegments.length;
  if (countToAdd > 0) {
    for (let i = 0; i < countToAdd; i++) {
      addTasteSegment();
    }
  }
}

/**
 * Add a single taste segment (helper)
 */
function addTasteSegment(data = null) {
  const container = document.getElementById("howToUseSegments");
  const div = document.createElement("div");
  div.className = "htu-segment row g-3 mb-3";

  // Store ID if exists
  if (data && data.id) {
    div.dataset.id = data.id;
  }

  const title = data ? data.title : "";
  const desc = data ? data.description : "";

  // Icon preview logic could be added here if backend sends icon URL
  // For now, just inputs

  div.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control htu-title" placeholder="Segment Title" value="${title}">
        </div>
        <div class="col-md-5">
            <textarea class="form-control htu-description" rows="2" placeholder="Segment Description">${desc}</textarea>
        </div>
        <div class="col-md-2">
            <input type="file" class="form-control htu-image" accept="image/*">
            ${data && data.icon ? `<small class="text-muted">Current: ${data.icon}</small>` : ''}
        </div>
        <div class="col-md-1 d-flex align-items-center">
            <button type="button" class="btn btn-outline-danger btn-sm remove-htu-segment">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

  container.appendChild(div);

  // Add delete listener
  const removeBtn = div.querySelector(".remove-htu-segment");
  removeBtn.addEventListener("click", function () {
    if (div.dataset.id) {
      // Track deleted ID
      if (!window.deletedTasteSegments) {
        window.deletedTasteSegments = new Set();
      }
      window.deletedTasteSegments.add(div.dataset.id);
      console.log("🗑️ Marked taste segment for deletion:", div.dataset.id);
    }
    div.remove();
  });
}

// Export new functions
window.loadTasteSegments = loadTasteSegments;
window.addTasteSegment = addTasteSegment;

