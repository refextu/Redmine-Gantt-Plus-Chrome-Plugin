$('.ganttLeftMonth' ).live('click',function(_evt){ Gantt.addDays(-30); });
$('.ganttRightMonth').live('click',function(_evt){ Gantt.addDays(30);  });
$('.ganttToday').live('click',function(_evt){      Gantt.setToday();   });
$('.ganttLeftWeek').live('click',function(_evt){   Gantt.addDays(-7);  });
$('.ganttRightWeek').live('click',function(_evt){  Gantt.addDays(7);   });

$('.ganttTask').live('mousedown',function(_evt){
  Gantt.item = new item(this,_evt);
  if(Gantt.item.mouse.start+5 > Gantt.item.margin+Gantt.item.width) {
    Gantt.item.type = 'effort';
  } else {
    Gantt.item.type = 'start';
  }
});


$('.ganttPoint').live('mousedown',function(_evt){
  Gantt.item = new item(this,_evt);
  Gantt.item.type = 'end';
});




$('.ganttSlider').live('mousemove',function(_evt){
  if(Gantt.item){
  	switch(Gantt.item.type) {
  		case "start":
			Gantt.item.current.css('margin-left', Gantt.item.updateMargin(_evt) + 'px');
  			break;
  		case "effort":
        	Gantt.item.current.css('width', Gantt.item.updateWidth(_evt)  + 'px') ;
  			break;
  		case "end":
			Gantt.item.current.css('margin-left', Gantt.item.updateMargin(_evt) + 'px');
			break;
  	}
  }
});

$('.ganttSlider').live('mouseup',function(_evt){
  var diff = Gantt.item.mouse.start - _evt.clientX;
  if( diff > -5 && diff < 5) {
    document.location = "/issues/"+Gantt.item.current.attr('title');
  } else {
    if(Gantt.item){
      saveDate(Gantt.item.current,Gantt.item.type);
    }
  }
  Gantt.item = null;
});