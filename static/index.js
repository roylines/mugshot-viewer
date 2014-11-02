
function drawImages() {
  var images = [];
  $.getJSON('images')
    .success(function(data) {
      images = data;

      var template = Handlebars.compile($("#image-template").html());
      _.forEach(_.first(data, 50), function(image) {
        image.width = 200;
        $('#gallery').append(template(image));
      });
    })
}

$(document).ready(function() {
  drawImages();
});
