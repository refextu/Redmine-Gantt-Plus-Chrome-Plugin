var now = new Date()
now.setUTCHours(0);
now.setUTCMinutes(0);
now.setUTCSeconds(0);
now.setUTCMilliseconds(0);
var date = now.getTime();
var dayWidth = 40;
var dayOffset = 2;
var current = null;
var currentM = null;
var startX = 0;
var currentX = 0;
var currentW = 0;
var slide = true;

var aDay = 86400000;

var effortADay = 4;

var gantts = [];


buildDays();

  $('.ganttLeftMonth').live('click',function(_evt){
    date = date - (30 * aDay);
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    buildDays();
  });
  $('.ganttRightMonth').live('click',function(_evt){
    date = date + (30 * aDay);
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    buildDays();
  });
  $('.ganttToday').live('click',function(_evt){
    var now = new Date()
    now.setUTCHours(0);
    now.setUTCMinutes(0);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);
    date = now.getTime();
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    buildDays();
  });
  $('.ganttLeftWeek').live('click',function(_evt){
    date = date - (7 * aDay);
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    buildDays();
  });
  $('.ganttRightWeek').live('click',function(_evt){
    date = date + (7 * aDay);
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    buildDays();
  });


function buildDays() {

$('.group').each(function(index){
  $(this).find('td').append('<div class="ganttControls" id="gc'+index+'"><span class="ganttLeftMonth">- 1 M</span> | <span class="ganttLeftWeek">- 1 W</span> | <span class="ganttToday">Heute</span> | <span class="ganttRightWeek">+ 1 W</span> | <span class="ganttRightMonth">+ 1 M</span></div>')
  $(this).find('td').append('<div class="ganttSlider" id="gs'+index+'"/>');

  $('#gs'+index).css('background-position',(((-1 * new Date(date).getDay())+dayOffset+1) * dayWidth )+'px 0');

  $('#gs'+index).append('<div class="ganttDate"></div>');
  for(var i = 0;i<10;i++) {
    var item = new Date(date + (((7*i)-2) * aDay));
    var vdate = item.getDate()+'.'+(item.getMonth()+1)+'.';
    $('#gs'+index+' .ganttDate').append('<div class="ganttDateItem gdi'+i+'">'+vdate+'</div>');
  }
  $('#gs'+index+' .ganttDate').find('.gdi0').css('margin-left',(((-1 * new Date(date).getDay())+dayOffset+1) * dayWidth )+'px');

  var group = this;
  var i = 0;
  gantts[index]= [];
  var n = group.nextSibling;
  while (n != undefined && !$(n).hasClass('group')) {
    if(n.tagName=='TR') {

      var g = {};

      g.start = getDate($(n).find('.start_date').text());
      g.end = getDate($(n).find('.due_date').text());
      g.effort = $(n).find('.estimated_hours').text();
      g.days = Math.ceil(g.effort / effortADay );
      g.startday = new Date(g.start).getDay();

      g.day = []
      var j = 0;
      var d = 0;
      while(d<g.days) {
        var now = (g.start + (j * aDay));
        if(testDay(now)){
          g.day[now] = true;
          d++;
        } else {
          g.day[now] = false;
        }
        g.day.length++;
        j++;
      }
      gantts[index][i] = g;

      var diff = getTimeDiff(date,g.start) + dayOffset;
      //var duration =  getTimeDiff(start,end)+ 1;
      var duration = g.day.length;
      $('#gs'+index).append('<div class="ganttTask" title="'+$(n).find('.id a').text()+'" style="margin-left: '+(dayWidth*diff)+'px; width: '+(dayWidth*duration)+'px">'+$(n).find('.subject a').text()+'</div>');
      i++;
    }
    n = n.nextSibling;
  }
});
  


}

function testDay(_d) {
  var d = new Date(_d).getDay();
  switch(d) {
    case 0 : 
      return false;
    case 6 : 
      return false;
    default : 
      return true;
  }
}


$('body').keydown(function(_evt){
  if(_evt.keyCode==187){
    
  } else if(_evt.keyCode==189){
    
  }
});


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

function saveDate(_this) {
  var id = $(_this).attr('title');

  var margin = parseInt($(_this).css('margin-left'));
  var width = parseInt($(_this).css('width'));
  var start = Math.round(margin / dayWidth) - dayOffset;
  var end = Math.round(width / dayWidth) - 1;
  
  var startDate = new Date(date + ((start-1) * aDay));
  var endDate = new Date(date + ((start + end ) *  aDay));
  
  var startDateString = dayString(startDate);
  var endDateString = dayString(endDate);
  var url = 'https://redmine.yoc.com/issues/bulk_edit';
  var data = 'authenticity_token='+$('input[name=authenticity_token]').attr('value')
  data+='&back_url=%2Fprojects%2Fsafefqwefqwedfasd%2Fissues&ids%5B%5D='+id
  data+='&issue%5Bstart_date%5D='+startDateString+'&issue%5Bdue_date%5D='+endDateString+'&commit=OK';
  console.log(startDateString+':'+endDateString);
  $.ajax({
    type: 'POST',
    url: url,
    data: data,
    success: function() { },
    complete : function() { document.location = "/projects/safefqwefqwedfasd/issues"; }
  });
}


function dayString(_d){
  var d = _d.getDate() + 1;
  if(d<10){ d = "0"+d; }
  var m = _d.getMonth() + 1;
  if(m<10){ m = "0"+m; }
  var y = _d.getFullYear();
  return y+'-'+m+'-'+d;
}

function getTimeDiff (_a,_b){
	return ((_b - _a) / 86400 / 1000);
}

function getDate(_d){
	if(_d.indexOf('.')>-1) {
      var reg = _d.match(/(\d+)/g);
      var d = reg[0];    
      var m = reg[1];    
      var y = reg[2]; 
      var date = y+"-"+m+"-"+d;
      return new Date(date).getTime();  
    } else {
       return 0;
    }
}


