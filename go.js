
/* Datum */
var now = new Date(); 
var date = now.getTime();


/* Darstellungsvariablen */
var dayWidth = 40;
var dayOffset = 1;
var effortADay = 8;
var aDay = 86400000;

var current = null;
var currentM = null;
var startX = 0;
var currentX = 0;
var currentW = 0;
var slide = true;

var gantts = [];

Gantt = {
  date : new Date(),
  time : null,
  day : null,
  view : {
    day : {
      width : 40,
      offset : 1,
      effort : 8,
      ms : 86400000
    },
    current : null,
    currentM : null,
    startX : 0,
    currentX : 0,
    currentW : 0,
    slide : true
  },
  gantts : [],
  update : function() {
    this.date.setUTCHours(0); 
    this.date.setUTCMinutes(0); 
    this.date.setUTCSeconds(0); 
    this.date.setUTCMilliseconds(0);
    this.time = this.date.getTime();
    this.day = this.date.getDay() - 1;
    if(this.day <0) { this.day = 6; }
    this.build();
  },
  setToday : function() {
    this.date = new Date();
    this.update();
  },
  addDays : function(_days){
    this.date = new Date(this.time + (_days * this.view.day.ms));
    this.update();
  },
  build : function() {
    $('.ganttControls').remove();
    $('.ganttSlider').remove();

    $('.group').each(function(index){


      var gsindex = index;
      $(this).find('td').append('<div class="ganttControls" id="gc'+index+'"><span class="ganttLeftMonth">- 1 M</span> | <span class="ganttLeftWeek">- 1 W</span> | <span class="ganttToday">Heute</span> | <span class="ganttRightWeek">+ 1 W</span> | <span class="ganttRightMonth">+ 1 M</span></div>')
      $(this).find('td').append('<div class="ganttSlider" id="gs'+gsindex+'"/>');
      $('#gs'+index).append('<div class="ganttDate"></div>');

      for(var i = 0;i<10;i++) {
        var item = new Date(Gantt.time + (((7*i) - Gantt.day ) * Gantt.view.day.ms));
        var vdate = item.getDate()+'.'+(item.getMonth()+1)+'.';
        $('#gs'+gsindex+' .ganttDate').append('<div class="ganttDateItem gdi'+i+'">'+vdate+'</div>');
      }

      var marginleft = -1 * (Gantt.day - Gantt.view.day.offset) * Gantt.view.day.width;
      $('#gs'+gsindex).css('background-position',marginleft+'px 0');
      $('#gs'+gsindex+' .ganttDate').find('.gdi0').css('margin-left',marginleft+'px');
      
    
      $(this).find('.issue').each(function(index){

        var g = {
          start : getDate($(this).find('.start_date').text()),
          end   : getDate($(this).find('.due_date').text()),
          effort : $(this).find('.estimated_hours').text(),
          day : [],
          days : function() { return Math.ceil(this.effort / Gantt.view.day.effort ); },
          startday : function() { return new Date(this.start).getDay();}
        };


        console.log(g);

        var diff = getTimeDiff(Gantt.time,g.start) + Gantt.view.day.offset;
        var duration = g.day.length;

        $('#gs'+gsindex).append('<div class="ganttTask" title="'+$(this).find('.id a').text()+'" style="margin-left: '+(Gantt.view.day.width*diff)+'px; width: '+(Gantt.view.day.width*duration)+'px">'+$(this).find('.subject a').text()+'</div>');


      });

    /*
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
        var duration = g.day.length;
        $('#gs'+index).append('<div class="ganttTask" title="'+$(n).find('.id a').text()+'" style="margin-left: '+(dayWidth*diff)+'px; width: '+(dayWidth*duration)+'px">'+$(n).find('.subject a').text()+'</div>');
        i++;
      }
      n = n.nextSibling;
    }*/
  });


  }  
}

Gantt.update();



function saveDate(_this) {
  var id = $(_this).attr('title');

  var margin = parseInt($(_this).css('margin-left'));
  var width = parseInt($(_this).css('width'));
  var start = Math.round(margin / dayWidth) - dayOffset;
  var end = Math.round(width / dayWidth) - 1;
  
  var startDate = new Date(date + ((start) * aDay));
  var endDate = new Date(date + ((start + end ) *  aDay));
  
  var startDateString = dayString(startDate);
  var endDateString = dayString(endDate);

  var url = '/issues/'+id+'.json';
  $.ajax({
    type: 'GET',
    url: url, 
    success: function(data) { 
      data.issue.start_date = startDateString;
      data.issue.due_date = endDateString;
      $.ajax({
        type: 'PUT',
        url: url,
        data: data, 
        success: function() { },
        complete : function() { document.location = "/projects/safefqwefqwedfasd/issues?query_id=300"; }
      });
    }

  });
}




