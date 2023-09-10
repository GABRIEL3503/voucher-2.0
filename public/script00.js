// Función para generar un ID aleatorio para el voucher
function generateVoucherID() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // Función para crear un nuevo voucher
  async function createVoucher(message) {  
    const id = generateVoucherID();
    console.log("Generated Voucher ID:", id);

    // Enviar petición al backend para crear un nuevo voucher
    const response = await fetch('https://vauchers1-0.onrender.com/create', {
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, message })
    });
    document.getElementById("removeVoucher").style.display = "inline";
    if (response.ok) {
      // Generar QR con el ID del voucher
      new QRCode(document.getElementById("qrcode"), {
        text: `https://vauchers1-0.onrender.com/validate.html?voucher_id=${id}`,
        width: 128,
        height: 128
      });
      
    
  
  // Mostrar alerta de éxito con Sweet Alert
  Swal.fire(
    '¡Creado!',
    'El voucher ha sido creado exitosamente.',
    'success'
  );
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

  // Función para eliminar el QR generado
function removeVoucher() {
    // Elimina el contenido del div que contiene el QR
    document.getElementById("qrcode").innerHTML = "";
    
    // Ocultar el botón de eliminar
    document.getElementById("removeVoucher").style.display = "none";
  }// Añadir evento al botón para eliminar el QR
document.getElementById("removeVoucher").addEventListener("click", removeVoucher);