$(document).ready(function() {
  var images = [];

  $.getJSON('images')
    .success(function(data) {
      images = data;

      var list = $("body").append('<ul></ul>').find('ul');
      _.forEach(_.first(images, 5), function(image) {
        list.append('<li><img width="200" src="image/' + image.key + '"></img></li>');
      });
    })
});
