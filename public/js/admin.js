// Converts a chosen image file into a data URL and stores it in the target input,
// so project images can be uploaded without extra server-side multipart handling.
document.querySelectorAll('.file-to-dataurl').forEach(function (input) {
  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('That image is larger than 4 MB. Please choose a smaller image.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var targetId = input.getAttribute('data-target');
      var target = document.getElementById(targetId);
      if (target) {
        target.value = reader.result;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    reader.readAsDataURL(file);
  });
});
