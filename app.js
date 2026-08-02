document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const shortenForm = document.getElementById('shortenForm');
    const longUrlInput = document.getElementById('longUrl');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const shortenedUrlElem = document.getElementById('shortenedUrl');
    const copyBtn = document.getElementById('copyBtn');
    const openBtn = document.getElementById('openBtn');
    
    // Accordion Elements
    const accordionToggle = document.getElementById('accordionToggle');
    const stylingAccordion = document.getElementById('stylingAccordion');

    // QR Code Customization Inputs
    const dotsTypeSelect = document.getElementById('dotsTypeSelect');
    const cornersTypeSelect = document.getElementById('cornersTypeSelect');
    const cornersDotTypeSelect = document.getElementById('cornersDotTypeSelect');
    const dotsColorInput = document.getElementById('dotsColor');
    const bgColorInput = document.getElementById('bgColor');
    const logoUpload = document.getElementById('logoUpload');
    const logoInfo = document.getElementById('logoInfo');
    const logoFileName = document.getElementById('logoFileName');
    const removeLogoBtn = document.getElementById('removeLogoBtn');
    const qrSizeInput = document.getElementById('qrSize');
    const qrSizeVal = document.getElementById('qrSizeVal');
    
    // Action Buttons
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const resetBtn = document.getElementById('resetBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleIcon = document.getElementById('themeToggleIcon');
    const toastContainer = document.getElementById('toastContainer');

    // SVG icons for Theme Switcher
    const moonIconSvg = `<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>`;
    const sunIconSvg = `<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 1 0 0-2H2a1 1 0 1 0 0 2zm18 0h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2zM11 2v2a1 1 0 1 0 2 0V2a1 1 0 1 0-2 0zm0 18v2a1 1 0 1 0 2 0v-2a1 1 0 1 0-2 0zM5.99 4.58a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41L5.99 4.58zm12.37 12.37a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41l-1.06-1.06zm-12.37 11.3a1 1 0 1 0 1.41 1.41l1.06-1.06a1 1 0 1 0-1.41-1.41l-1.06 1.06zm12.37-12.37a1 1 0 1 0 1.41-1.41l-1.06-1.06a1 1 0 1 0-1.41 1.41l1.06 1.06z"/>`;

    // State Variables
    let currentLogoBase64 = null;
    let qrTargetUrl = "https://google.com";

    // 1. Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `;
        } else {
            iconSvg = `
                <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
        }
        
        toast.innerHTML = `
            ${iconSvg}
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger show animation
        setTimeout(() => toast.classList.add('show'), 50);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // 2. Initialize QRCodeStyling Object
    const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "canvas",
        data: qrTargetUrl,
        image: null,
        dotsOptions: {
            color: "#6366f1",
            type: "rounded"
        },
        backgroundOptions: {
            color: "#ffffff"
        },
        cornersSquareOptions: {
            type: "extra-rounded",
            color: "#6366f1"
        },
        cornersDotOptions: {
            type: "dot",
            color: "#6366f1"
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 8,
            imageSize: 0.4,
            hideBackgroundDots: true
        }
    });

    // Render the QR code canvas to DOM
    qrCode.append(document.getElementById('qrCanvas'));

    // 3. Update QR Code Dynamically
    function updateQrCode() {
        const size = parseInt(qrSizeInput.value) || 300;
        const dotsType = dotsTypeSelect.value;
        const cornersType = cornersTypeSelect.value;
        const cornersDotType = cornersDotTypeSelect.value;
        const dotsColor = dotsColorInput.value;
        const bgColor = bgColorInput.value;

        qrCode.update({
            width: size,
            height: size,
            data: qrTargetUrl,
            image: currentLogoBase64,
            dotsOptions: {
                color: dotsColor,
                type: dotsType
            },
            backgroundOptions: {
                color: bgColor
            },
            cornersSquareOptions: {
                color: dotsColor,
                type: cornersType
            },
            cornersDotOptions: {
                color: dotsColor,
                type: cornersDotType
            }
        });
    }

    // 4. API Link Shortening
    async function shortenUrl(longUrl) {
        const endpoint = 'https://tinyurl.com/api-create.php';
        const url = new URL(endpoint);
        url.searchParams.set('url', longUrl);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error(`Mã lỗi HTTP: ${response.status}`);
            }

            const shortUrl = (await response.text()).trim();
            if (!shortUrl || !/^https?:\/\//i.test(shortUrl)) {
                throw new Error('Phản hồi từ dịch vụ không hợp lệ.');
            }

            return shortUrl;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Shorten Form Submit Handler
    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalUrl = longUrlInput.value.trim();
        if (!originalUrl) return;

        // Reset and set loading states
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            //const shortUrl = await shortenUrl(originalUrl);
            const shortUrl = await originalUrl;
            qrTargetUrl = originalUrl;
            
            // Show result link
            shortenedUrlElem.textContent = shortUrl;
            resultContainer.style.display = 'flex';
            
            // Update QR code data with the shortened link
            updateQrCode();
            showToast('Rút gọn link thành công!');
        } catch (error) {
            // Fallback: If shorten API fails, generate QR for the original long link instead
            console.log('Shortening failed. Generating QR for original URL.');
            qrTargetUrl = originalUrl;
            
            shortenedUrlElem.textContent = "Không thể rút gọn link. Đang dùng link gốc.";
            resultContainer.style.display = 'flex';
            
            updateQrCode();
            showToast('Lỗi rút gọn link. Đã tự động tạo mã QR từ link gốc.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });

    // 5. Copy Shortened URL to Clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = shortenedUrlElem.textContent;
        // Do not copy fallback failure message
        if (textToCopy.startsWith("Không thể rút gọn")) {
            showToast('Không có link hợp lệ để copy!', 'error');
            return;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showToast('Đã sao chép link rút gọn!');
                
                // Animate copy button icon change
                const originalSvg = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                copyBtn.classList.add('success');

                setTimeout(() => {
                    copyBtn.innerHTML = originalSvg;
                    copyBtn.classList.remove('success');
                }, 2000);
            })
            .catch(err => {
                showToast('Lỗi khi sao chép link.', 'error');
            });
    });

    // Open link button click
    openBtn.addEventListener('click', () => {
        const url = shortenedUrlElem.textContent;
        if (url && !url.startsWith("Không thể rút gọn")) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (longUrlInput.value) {
            window.open(longUrlInput.value, '_blank', 'noopener,noreferrer');
        } else {
            showToast('Không có liên kết để mở.', 'error');
        }
    });

    // 6. Handle Logo Uploads
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Vui lòng chọn một tệp hình ảnh!', 'error');
            logoUpload.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentLogoBase64 = event.target.result;
            
            // Show Logo details UI
            logoFileName.textContent = file.name;
            logoInfo.style.display = 'flex';
            
            // Update QR code with uploaded logo
            updateQrCode();
            showToast('Đã tải lên logo thành công!');
        };
        reader.readAsDataURL(file);
    });

    // Remove Logo Button
    removeLogoBtn.addEventListener('click', () => {
        logoUpload.value = '';
        currentLogoBase64 = null;
        logoInfo.style.display = 'none';
        updateQrCode();
        showToast('Đã xóa logo.');
    });

    // 7. QR Download Trigger
    downloadPngBtn.addEventListener('click', () => {
        showToast('Đang tạo và tải file PNG...');
        qrCode.download({
            name: `qr-lnk-${Date.now()}`,
            extension: "png"
        });
    });

    downloadSvgBtn.addEventListener('click', () => {
        showToast('Đang tạo và tải file SVG...');
        qrCode.download({
            name: `qr-lnk-${Date.now()}`,
            extension: "svg"
        });
    });

    // 8. Event Listeners for QR design updates
    dotsTypeSelect.addEventListener('change', updateQrCode);
    cornersTypeSelect.addEventListener('change', updateQrCode);
    cornersDotTypeSelect.addEventListener('change', updateQrCode);
    dotsColorInput.addEventListener('input', updateQrCode);
    bgColorInput.addEventListener('input', updateQrCode);
    
    // QR Size Slider
    qrSizeInput.addEventListener('input', (e) => {
        const val = e.target.value;
        qrSizeVal.textContent = `${val} x ${val} px`;
        updateQrCode();
    });

    // Reset Design Button
    resetBtn.addEventListener('click', () => {
        // Restore defaults
        dotsTypeSelect.value = "rounded";
        cornersTypeSelect.value = "extra-rounded";
        cornersDotTypeSelect.value = "dot";
        dotsColorInput.value = "#6366f1";
        bgColorInput.value = "#ffffff";
        qrSizeInput.value = "300";
        qrSizeVal.textContent = "300 x 300 px";
        
        // Remove logo
        logoUpload.value = '';
        currentLogoBase64 = null;
        logoInfo.style.display = 'none';

        updateQrCode();
        showToast('Thiết kế đã được khôi phục về mặc định.');
    });

    // 9. Light/Dark Mode Switcher
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update SVG icon path
        if (theme === 'light') {
            themeToggleIcon.innerHTML = sunIconSvg;
            themeToggleBtn.style.color = '#eab308'; // Amber sun color
        } else {
            themeToggleIcon.innerHTML = moonIconSvg;
            themeToggleBtn.style.color = ''; // Revert to stylesheet default
        }
    }

    // Toggle theme event click
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    // Initial theme check
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Fallback to browser preference or default to dark
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }

    // 10. Custom Accordion UI toggle
    accordionToggle.addEventListener('click', () => {
        stylingAccordion.classList.toggle('active');
    });
});
