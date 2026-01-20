// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
const removeImageBtn = document.getElementById('removeImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const countA = document.getElementById('countA');
const countB = document.getElementById('countB');
const countC = document.getElementById('countC');
const countD = document.getElementById('countD');
const usedClassifier = document.getElementById('usedClassifier');
const totalCount = document.getElementById('totalCount');

// Classifier names mapping
const classifierNames = {
    'knn-cosine': 'KNN Cosine',
    'knn-cubic': 'KNN Cubic',
    'naive-bayes': 'Naive Bayes'
};

// Kolory dla każdej kategorii
const categoryColors = {
    A: '#3b82f6',  // niebieski
    B: '#10b981',  // zielony
    C: '#f59e0b',  // pomarańczowy
    D: '#ef4444'   // czerwony
};

// Przechowuj ostatnie regions dla resize
let lastRegions = null;

// Mock classification function
function mockClassify(imageFile, classifierType) {
    // Simulate processing time
    return new Promise((resolve) => {
        setTimeout(() => {
            let counts = { A: 0, B: 0, C: 0, D: 0 };
            
            // Different mock behaviors for each classifier
            switch(classifierType) {
                case 'knn-cosine':
                    // KNN Cosine tends to find more category A and B
                    counts.A = Math.floor(Math.random() * 25) + 15;
                    counts.B = Math.floor(Math.random() * 20) + 10;
                    counts.C = Math.floor(Math.random() * 15) + 5;
                    counts.D = Math.floor(Math.random() * 10) + 2;
                    break;
                    
                case 'knn-cubic':
                    // KNN Cubic tends to find more balanced distribution
                    counts.A = Math.floor(Math.random() * 20) + 8;
                    counts.B = Math.floor(Math.random() * 20) + 8;
                    counts.C = Math.floor(Math.random() * 20) + 8;
                    counts.D = Math.floor(Math.random() * 15) + 5;
                    break;
                    
                case 'naive-bayes':
                    // Naive Bayes tends to find more category C and D
                    counts.A = Math.floor(Math.random() * 15) + 5;
                    counts.B = Math.floor(Math.random() * 15) + 5;
                    counts.C = Math.floor(Math.random() * 25) + 15;
                    counts.D = Math.floor(Math.random() * 20) + 10;
                    break;
            }
            
            resolve(counts);
        }, 2000 + Math.random() * 1000); // 2-3 seconds delay
    });
}

// Funkcja do generowania losowych obszarów komórek z różnymi kształtami
function generateCellRegions(imageWidth, imageHeight, counts) {
    const regions = [];
    const shapes = ['circle', 'rect', 'ellipse', 'polygon', 'star'];
    
    Object.keys(counts).forEach(category => {
        const count = counts[category];
        for (let i = 0; i < count; i++) {
            // Losowa pozycja (z marginesem od krawędzi)
            const margin = 40;
            const x = Math.random() * (imageWidth - 2 * margin) + margin;
            const y = Math.random() * (imageHeight - 2 * margin) + margin;
            
            // Losowy rozmiar (25-70px)
            const size = Math.random() * 45 + 25;
            
            // Losowy kształt
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            // Dodatkowe parametry dla różnych kształtów
            const rotation = Math.random() * Math.PI * 2;
            const aspectRatio = 0.7 + Math.random() * 0.6; // dla elipsy
            
            regions.push({
                category,
                x,
                y,
                size,
                shape,
                rotation,
                aspectRatio
            });
        }
    });
    
    return regions;
}

// Funkcja do rysowania kształtu na canvas
function drawShape(ctx, region, scaleX, scaleY) {
    const color = categoryColors[region.category];
    const x = region.x * scaleX;
    const y = region.y * scaleY;
    const size = region.size * Math.min(scaleX, scaleY);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '50'; // ~31% opacity
    ctx.lineWidth = 3;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(region.rotation);
    
    switch(region.shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'rect':
            const halfSize = size / 2;
            ctx.fillRect(-halfSize, -halfSize, size, size);
            ctx.strokeRect(-halfSize, -halfSize, size, size);
            break;
            
        case 'ellipse':
            ctx.beginPath();
            ctx.ellipse(0, 0, size / 2, size / 2 * region.aspectRatio, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'polygon':
            const sides = 5 + Math.floor(Math.random() * 3); // 5-7 boków
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 * i) / sides;
                const px = Math.cos(angle) * size / 2;
                const py = Math.sin(angle) * size / 2;
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'star':
            const points = 5;
            const outerRadius = size / 2;
            const innerRadius = outerRadius * 0.4;
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
                const angle = (Math.PI * i) / points;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

// Funkcja do rysowania obszarów na canvas
function drawCellRegions(regions) {
    const img = previewImage;
    
    // Sprawdź czy obraz jest załadowany
    if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        img.onload = () => {
            drawCellRegions(regions);
        };
        return;
    }
    
    // Pobierz wymiary obrazu
    const imgRect = img.getBoundingClientRect();
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayWidth = imgRect.width;
    const displayHeight = imgRect.height;
    
    // Ustaw rozmiar canvas na rozmiar wyświetlanego obrazu
    overlayCanvas.width = displayWidth;
    overlayCanvas.height = displayHeight;
    
    // Wyczyść canvas
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Skalowanie współrzędnych
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;
    
    // Rysuj każdy obszar
    regions.forEach(region => {
        drawShape(overlayCtx, region, scaleX, scaleY);
    });
}

// Animate number counting
function animateCount(element, targetValue) {
    const duration = 1500;
    const startValue = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = targetValue;
        }
    }
    
    requestAnimationFrame(update);
}

// File upload handling
uploadArea.addEventListener('click', () => {
    if (!previewContainer.style.display || previewContainer.style.display === 'none') {
        fileInput.click();
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        displayPreview(file);
    }
});

// Drag and drop handling
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        displayPreview(file);
    }
});

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
        uploadArea.querySelector('.upload-content').style.display = 'none';
        analyzeBtn.disabled = false;
        
        // Wyczyść canvas przy nowym obrazie
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        lastRegions = null;
    };
    reader.readAsDataURL(file);
}

// Remove image
removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    previewImage.src = '';
    previewContainer.style.display = 'none';
    uploadArea.querySelector('.upload-content').style.display = 'flex';
    fileInput.value = '';
    analyzeBtn.disabled = true;
    resultsSection.style.display = 'none';
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    lastRegions = null;
});

// Analyze button
analyzeBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) return;
    
    const selectedClassifier = document.querySelector('input[name="classifier"]:checked').value;
    
    // Disable button and show loading
    analyzeBtn.disabled = true;
    analyzeBtn.querySelector('.btn-text').style.display = 'none';
    analyzeBtn.querySelector('.btn-loader').style.display = 'inline-block';
    
    // Hide previous results
    resultsSection.style.display = 'none';
    
    try {
        // Mock classification
        const counts = await mockClassify(fileInput.files[0], selectedClassifier);
        
        // Generuj i rysuj obszary komórek
        const img = previewImage;
        let regions;
        
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            regions = generateCellRegions(img.naturalWidth, img.naturalHeight, counts);
            lastRegions = regions;
            drawCellRegions(regions);
        } else {
            img.onload = () => {
                regions = generateCellRegions(img.naturalWidth, img.naturalHeight, counts);
                lastRegions = regions;
                drawCellRegions(regions);
            };
        }
        
        // Update UI
        usedClassifier.textContent = classifierNames[selectedClassifier];
        
        // Animate counts
        animateCount(countA, counts.A);
        animateCount(countB, counts.B);
        animateCount(countC, counts.C);
        animateCount(countD, counts.D);
        
        // Calculate total
        const total = counts.A + counts.B + counts.C + counts.D;
        animateCount(totalCount, total);
        
        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('Classification error:', error);
        alert('Wystąpił błąd podczas klasyfikacji. Spróbuj ponownie.');
    } finally {
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.querySelector('.btn-text').style.display = 'inline';
        analyzeBtn.querySelector('.btn-loader').style.display = 'none';
    }
});

// Obsługa zmiany rozmiaru okna - przeskaluj canvas
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (lastRegions && previewContainer.style.display !== 'none') {
            drawCellRegions(lastRegions);
        }
    }, 250);
});

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

