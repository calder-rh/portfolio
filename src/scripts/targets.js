import $ from 'jquery';

function assignIDs() {
  let idCounter = 1;
  $('.img-target').each(function() {
    $(this).attr('id', `img${idCounter}`);
    idCounter++;
  });
}

// function imageTargets() {
//   $('.img-target').each(function() {
//     var siblingImage = $(this).siblings('img');
//     if (siblingImage.length > 0) {
//       var siblingHeight = siblingImage.height();
//       $(this).height(siblingHeight);
//     }
//   });
// }

document.addEventListener('DOMContentLoaded', assignIDs);
// $(document).ready(imageTargets);
// $(window).on('resize', imageTargets);
