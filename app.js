// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
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

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

