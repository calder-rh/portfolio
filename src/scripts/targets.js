import $ from 'jquery';

function imageTargets() {
  $('.img-target').each(function() {
    var siblingImage = $(this).siblings('img');
    if (siblingImage.length > 0) {
      var siblingHeight = siblingImage.height();
      $(this).height(siblingHeight);
    }
  });
}

$(document).ready(imageTargets);
$(window).on('resize', imageTargets);
