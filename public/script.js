document.addEventListener("DOMContentLoaded", function() {
  Swal.fire({
    title: 'Iniciar Sesión',
    html:
      '<input type="text" id="login" class="swal2-input" placeholder="Usuario">' +
      '<input type="password" id="password" class="swal2-input" placeholder="Contraseña">',
    confirmButtonText: 'Iniciar Sesión',
    focusConfirm: false,
    allowOutsideClick: false,  // Esto evita que el modal se cierre al hacer clic fuera
  // En el preConfirm del modal de SweetAlert2
preConfirm: () => {
  let login = Swal.getPopup().querySelector('#login').value.trim().toLowerCase();
  let password = Swal.getPopup().querySelector('#password').value.trim().toLowerCase();


  // Llamada al endpoint de autenticación
  fetch('https://vauchers2-0.onrender.com/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: login, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Contraseña o usuario incorrecto');
    }
    return response.json();
  })
  .then(data => {
    localStorage.setItem('token', data.token);
    // Eliminar o esconder la capa opaca
    document.getElementById('overlay').style.display = 'none';
  })
  .catch(error => {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Contraseña o usuario incorrecto'
    });
  });
}

  });
});





// Función para generar un ID aleatorio para el voucher
function generateVoucherID() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // Función para crear un nuevo voucher
  async function createVoucher(message) {  
    const id = generateVoucherID();
    const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const validUntil = document.getElementById('validUntil').value;
    console.log("Generated Voucher ID:", id);

    // Enviar petición al backend para crear un nuevo voucher
    // const response = await fetch('https://vauchers2-0.onrender.com/create', {
      const response = await fetch('https://vauchers2-0.onrender.com/create', {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, message, from_text: from, to_text: to, valid_until: validUntil })  // Agregar nuevos campos
    });

    if (response.ok) {
      // Generar QR con el ID del voucher
      new QRCode(document.getElementById("qrcode"), {
        text: `https://vauchers2-0.onrender.com/validate.html?voucher_id=${id}`,
        width: 128,
        height: 128
      });
      document.getElementById('createVoucher').style.display = 'none';

    
  
  // Mostrar alerta de éxito con Sweet Alert
  Swal.fire({
    title: '¡Voucher creado!',
    html: `
    Ahora puedes compartir este enlace: <a href="https://vauchers2-0.onrender.com/voucher.html?id=${id}" target="_blank">https://vauchers2-0.onrender.com/voucher.html?id=${id}</a>
    <br>
    `,
    icon: 'success',
    showConfirmButton: true 
  }).then(() => {
    // Crear el botón "Nuevo Voucher"
    const newVoucherButton = document.createElement('button');
    newVoucherButton.innerHTML = 'Nuevo Voucher';
    newVoucherButton.id = 'newVoucherButton';
    newVoucherButton.classList.add('center-button');
    newVoucherButton.addEventListener('click', function() {
      location.reload();
    });
    document.getElementById('shareButton').addEventListener('click', function() {
      if (navigator.share) {
        navigator.share({
          title: 'Mi Voucher',
          text: 'Mira este increíble voucher que acabo de crear.',
          url: `https://vauchers2-0.onrender.com/voucher.html?id=${id}`,
        })
        .then(() => console.log('Contenido compartido exitosamente'))
        .catch((error) => console.log('Hubo un error al compartir', error));
      } else {
        // Fallback para navegadores que no soportan la API Web Share
        alert(`Tu navegador no soporta la API Web Share. Copia y pega este enlace para compartir: https://vauchers2-0.onrender.com/voucher.html?id=${id}`);
      }
    });
  
    document.body.appendChild(newVoucherButton);
  
    // Crear el botón "Descargar Voucher"
    const downloadVoucherButton = document.createElement('button');
    downloadVoucherButton.innerHTML = 'Descargar Voucher';
    downloadVoucherButton.id = 'downloadVoucherButton';
    downloadVoucherButton.classList.add('center-button');
    downloadVoucherButton.addEventListener('click', function() {
      html2canvas(document.querySelector("#voucherCard")).then(canvas => {
        let imgData = canvas.toDataURL('image/png');
        let a = document.createElement('a');
        a.href = imgData;
        a.download = 'voucher.png';
        a.click();
      });
    });
    document.body.appendChild(downloadVoucherButton);
  });
  
} else {
  // Mostrar alerta de error con Sweet Alert
  Swal.fire(
    'Error',
    'Hubo un problema al crear el voucher.',
    'error'
  );
}
}// Función para mostrar el modal de Sweet Alert para el mensaje del premio
function showPrizePrompt() {
    Swal.fire({
      title: 'Ingrese el mensaje del premio',
      input: 'text',
      inputPlaceholder: 'Ejemplo: Premio: Camiseta Gratis'
    }).then((result) => {
      if (result.isConfirmed) {
        createVoucher(result.value);
      }
    });
  }
  
  // Añadir evento al botón para crear un nuevo voucher
  document.getElementById("createVoucher").addEventListener("click", showPrizePrompt);



// New code for handling metadata and card

// Show the modal when 'createVoucher' is invoked
function showMetadataModal() {
  const modal = document.getElementById('metadataModal');
  modal.style.display = 'block';
}


// Collect data from the modal
document.getElementById('submitMetadata').addEventListener('click', function() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const validUntil = document.getElementById('validUntil').value;
  
  // Update the card with collected data
  document.getElementById('fromText').textContent = `De parte de: ${from}`;
  document.getElementById('toText').textContent = `Para: ${to}`;
  document.getElementById('validUntilText').textContent = `Válido hasta: ${validUntil}`;
  
  // Hide the modal
  const modal = document.getElementById('metadataModal');
  modal.style.display = 'none';
  
  // Show the voucher card
  const voucherCard = document.getElementById('voucherCard');
  voucherCard.style.display = 'flex';
  // Show the "Crear Voucher" button
  document.getElementById('createVoucher').style.display = 'inline';
});





// Función para mostrar el historial de vouchers
async function showHistory() {
  const response = await fetch('hhttps://vauchers2-0.onrender.com/history');
  if (response.ok) {
    const vouchers = await response.json();
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';  // Limpiar el contenedor
    vouchers.forEach(voucher => {
      const voucherDiv = document.createElement('div');
      voucherDiv.innerHTML = `
        <strong>De:</strong> ${voucher.from_text} <br>
        <strong>Para:</strong> ${voucher.to_text} <br>
        <strong>Mensaje:</strong> ${voucher.message} <br>
        <strong>Validez:</strong> ${voucher.valid_until} <br>
        <hr>
      `;
      historyContainer.appendChild(voucherDiv);
    });
    historyContainer.style.display = 'block';
  } else {
    alert('Error al recuperar el historial');
  }
}

// Añadir evento al botón para mostrar el historial
document.getElementById("showHistory").addEventListener("click", showHistory);
document.getElementById('downloadVoucher').addEventListener('click', function() {
  html2canvas(document.querySelector("#voucherCard")).then(canvas => {
      let imgData = canvas.toDataURL('image/png');
      let a = document.createElement('a');
      a.href = imgData;
      a.download = 'voucher.png';
      a.click();
  });
});


var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: "https://www.google.com",
  width: 128,
  height: 128,
  colorDark : "#000000",
  colorLight : "#ffffff",
});


