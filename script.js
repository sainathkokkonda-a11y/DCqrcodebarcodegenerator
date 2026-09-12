let qrCode;
let logoDataUrl = null;

// Handle Logo file reading
document.getElementById('logo-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      logoDataUrl = event.target.result;
      generateCode(); // Auto refresh QR when logo is uploaded
    };
    reader.readAsDataURL(file);
  } else {
    logoDataUrl = null;
  }
});

function toggleInputs() {
  const type = document.getElementById('code-type').value;
  const input = document.getElementById('code-input');
  const qrOptionsGroup = document.getElementById('qr-custom-options');

  if (type === 'barcode') {
    input.placeholder = "e.g. 1234567890";
    input.value = "1234567890";
    qrOptionsGroup.style.display = "none";
  } else {
    input.placeholder = "e.g. https://yourwebsite.com";
    input.value = "https://example.com";
    qrOptionsGroup.style.display = "block";
  }
}

function generateCode() {
  const type = document.getElementById('code-type').value;
  const val = document.getElementById('code-input').value.trim();
  const qrDiv = document.getElementById('qrcode');
  const barcodeSvg = document.getElementById('barcode');
  const downloadBtn = document.getElementById('download-btn');

  if (!val) {
    alert("Please enter text or numbers.");
    return;
  }

  qrDiv.innerHTML = "";
  qrDiv.style.display = "none";
  barcodeSvg.style.display = "none";

  if (type === 'qr') {
    qrDiv.style.display = "block";
    const dotStyle = document.getElementById('dot-style').value;
    const qrColor = document.getElementById('qr-color').value;

    let config = {
      width: 150,
      height: 150,
      type: "canvas",
      data: val,
      dotsOptions: {
        color: qrColor,
        type: dotStyle
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        type: dotStyle === 'dots' ? 'dot' : 'square'
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      }
    };

    if (logoDataUrl) {
      config.image = logoDataUrl;
    }

    qrCode = new QRCodeStyling(config);
    qrCode.append(qrDiv);
    downloadBtn.style.display = "inline-block";
  } else {
    barcodeSvg.style.display = "block";
    try {
      JsBarcode("#barcode", val, {
        format: "CODE128",
        lineColor: "#000000",
        width: 2,
        height: 60,
        displayValue: true
      });
      downloadBtn.style.display = "inline-block";
    } catch (e) {
      alert("Invalid input for Barcode.");
      downloadBtn.style.display = "none";
    }
  }
}

function downloadImage() {
  const type = document.getElementById('code-type').value;
  const quality = parseInt(document.getElementById('download-quality').value) || 600;

  if (type === 'qr') {
    if (qrCode) {
      // Apply user selected custom resolution
      qrCode.update({
        width: quality,
        height: quality
      });

      qrCode.download({ name: "custom-qr-code", extension: "png" }).then(() => {
        // Reset back to preview size after download
        qrCode.update({
          width: 150,
          height: 150
        });
      });
    }
  } else {
    const svg = document.getElementById('barcode');
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(xml);
    const b64Start = 'data:image/svg+xml;base64,';
    const image64 = b64Start + svg64;

    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const scaleFactor = quality / 300; // Scale based on user choice
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png', 1.0);
      a.download = 'barcode-hd.png';
      a.click();
    };
    img.src = image64;
  }
}

// Initial load
window.onload = generateCode;
