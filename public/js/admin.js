// Converts a chosen file (image or video) into a data URL and stores it in the
// target input, so assets can be uploaded without extra server-side handling.
document.querySelectorAll('.file-to-dataurl').forEach(function (input) {
  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file) return;
    var isVideo = file.type && file.type.indexOf('video/') === 0;
    var maxSize = isVideo ? 20 * 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        'That ' + (isVideo ? 'video' : 'image') + ' is larger than ' +
        (isVideo ? '20 MB' : '4 MB') + '. Please choose a smaller file or use a link instead.'
      );
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
