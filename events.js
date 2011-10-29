$('.ganttLeftMonth' ).live('click',function(_evt){ Gantt.addDays(-30); });
$('.ganttRightMonth').live('click',function(_evt){ Gantt.addDays(30);  });
$('.ganttToday').live('click',function(_evt){      Gantt.todays();     });
$('.ganttLeftWeek').live('click',function(_evt){   Gantt.addDays(-7);  });
$('.ganttRightWeek').live('click',function(_evt){  Gantt.addDays(7);   });

$('.ganttTask').live('mousedown',function(_evt){
  currentX = _evt.clientX;
  startX = _evt.clientX;
  current = $(this);
  currentM = parseInt(current.css('margin-left'));
  currentW = parseInt(current.css('width'));
  if(currentX+5 > currentM+currentW) {
    slide = false;
  }
});

    $('.ganttSlider').live('mousemove',function(_evt){
      if(current != null){
        if(slide) {
          var margin = (currentM + _evt.clientX - currentX );
          current.css('margin-left', margin + 'px') ;
          currentM = parseInt(current.css('margin-left'));
          currentX = _evt.clientX;
        } else {
          var width = (currentW + _evt.clientX - currentX );
          current.css('width', width + 'px') ;
          currentW = parseInt(current.css('width')); 
          currentX = _evt.clientX;
        }
      }
    });

    $('.ganttSlider').live('mouseup',function(_evt){
      var diff = startX - _evt.clientX;
      if( diff > -5 && diff < 5) {
        document.location = "/issues/"+current.attr('title');
      } else {
        if(current!= null){
          saveDate(current);
        }
      }

      slide = true;
      current = null;
    });