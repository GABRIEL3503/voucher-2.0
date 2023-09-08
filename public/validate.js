// Obtener el ID del voucher desde la URL
const urlParams = new URLSearchParams(window.location.search);
const voucherID = urlParams.get('voucher_id');

// Función para validar el voucher
// async function validateVoucher() {
//     const response = await fetch(`http://localhost:3000/validate/${voucherID}`);
//     console.log("Backend Response:", response);


//   if (response.ok) {
//     const data = await response.json();
//     // Mostrar alerta de éxito con el mensaje del premio
//     Swal.fire(
//       '¡Válido!',
//       `Premio: ${data.message}`,
//       'success'
//     );
//   } else {
//     // Mostrar alerta de error indicando que el voucher ya ha sido canjeado o no existe
//     Swal.fire(
//       'Error',
//       'Este voucher ya ha sido canjeado o no es válido.',
//       'error'
//     );
//   }
// }
async function validateVoucher() {
  try {
    console.log("Validating voucher with ID:", voucherID); // Log before making the request
    const response = await fetch(`https://vauchers1-0.onrender.com/validate/${voucherID}`);
    console.log("Backend Response:", response);

    if (response.ok) {
      const data = await response.json();
      Swal.fire('¡Válido!', `Premio: ${data.message}`, 'success');
    } else {
      Swal.fire('Error', 'Este voucher ya ha sido canjeado o no es válido.', 'error');
    }
  } catch (error) {
    console.log("An error occurred:", error);
    Swal.fire('Error', 'Ocurrió un error durante la validación.', 'error');
  }
}


// Ejecutar la validación al cargar la página
validateVoucher();
