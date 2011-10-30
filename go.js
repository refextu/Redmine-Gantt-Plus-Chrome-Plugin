


/* Darstellungsvariablen */
var dayWidth = 40;
var effortADay = 8;
var aDay = 86400000;

var current = null;
var currentM = null;
var startX = 0;
var currentX = 0;
var currentW = 0;
var slide = true;


Gantt = {
  date : null,
  time : null,
  day : null,
  groups : [],
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
    this.date = new Date(new Date().getTime() - (this.view.day.offset * this.view.day.ms)); 
    this.update();
  },
  addDays : function(_days){
    this.date = new Date(this.time + (_days * this.view.day.ms));
    this.update();
  },
  buildGroup : function(_this,_index) {
    this.groups[_index] = {
      index : _index,
      tasks : [],
      workload : []
    };

    $(_this).find('td').append('<div class="ganttControls" id="gc'+_index+'"><span class="ganttLeftMonth">- 1 M</span> | <span class="ganttLeftWeek">- 1 W</span> | <span class="ganttToday">Heute</span> | <span class="ganttRightWeek">+ 1 W</span> | <span class="ganttRightMonth">+ 1 M</span></div>')
    
    $(_this).find('td').append('<div class="ganttSlider" id="gs'+_index+'"/>');
    $('#gs'+_index).append('<div class="ganttDate"></div>');
    $('#gs'+_index).append('<div class="ganttLoad"></div>');

    for(var i = 0;i<10;i++) {
      var item = new Date(Gantt.time + (((7*i) - Gantt.day ) * Gantt.view.day.ms));
      var vdate = item.getDate()+'.'+(item.getMonth()+1)+'.';
      $('#gs'+_index+' .ganttDate').append('<div class="ganttDateItem gdi'+i+'">'+vdate+'</div>');
    }

    var marginleft = -1 * (this.day) * this.view.day.width;
    $('#gs'+_index).css('background-position',marginleft+'px 0');
    $('#gs'+_index+' .ganttDate').find('.gdi0').css('margin-left',marginleft+'px');
  },
  buildTask : function(_node,_gindex) {
    var g = {
      start : getDate($(_node).find('.start_date').text()),
      end   : getDate($(_node).find('.due_date').text()),
      effort : $(_node).find('.estimated_hours').text(),
      id : $(_node).find('.id a').text(),
      subject : $(_node).find('.subject a').text(),
      day : [],
      days : function() { return Math.ceil(this.effort / Gantt.view.day.effort ); },
      startday : function() { return new Date(this.start).getDay();}
    };
    var j = 0;
    var d = 0;
    while(d<g.days()) {
      var now = (g.start + (j * Gantt.view.day.ms));
      if(testDay(now)){
        g.day[now] = 1;
        d++;
      } else {
        g.day[now] = 0;
      }
      g.day.length++;
      j++;
    }
    this.groups[_gindex].tasks.push(g);
    this.showTask(_gindex,this.groups[_gindex].tasks.length-1);
  },
  showTask : function(_gindex,_tindex) {
    var g = this.groups[_gindex].tasks[_tindex];
    var diff = getTimeDiff(Gantt.time,g.start);
    var diff2 = getTimeDiff(Gantt.time,g.end);
    $('#gs'+_gindex).append('<div class="ganttTask" title="'+g.id+'" style="margin-left: '+(Gantt.view.day.width*diff)+'px; width: '+(Gantt.view.day.width*g.day.length)+'px">'+g.subject+'</div>'); 
    $('#gs'+_gindex).append('<div class="ganttPoint" title="'+g.id+'" style="margin-left: '+(Gantt.view.day.width*diff2)+'px;">×</div>'); 
  },
  buildWorkload : function(_gindex) {
    var g = this.groups[_gindex];
    for(var i = 0; i< g.tasks.length; i++) {
      for(var n in g.tasks[i].day) {
        var wl = g.workload[n];
        if(wl===undefined) {wl = g.tasks[i].day[n]} else { wl += g.tasks[i].day[n]; }
        g.workload[n] = wl;
      }
    }
    for(var i = 0;i<30;i++) {
      var now = new Date(this.date.getTime() + (i*this.view.day.ms));
      var l = g.workload[now.getTime()];
      l = (l == undefined) ? 0 : l;
      l = (l * 100)+"%";
      $('#gs'+_gindex+' .ganttLoad').append('<div class="ganttDayItem gdi'+i+'">'+l+'</div>');
    }
  },
  build : function() {
    $('.ganttControls').remove();
    $('.ganttSlider').remove();
    $('.group').each(function(index){
      Gantt.buildGroup(this,index);
      var n = this.nextSibling;
      while (n != undefined && !$(n).hasClass('group')) {
        if(n.tagName=='TR') {
          Gantt.buildTask(n,index);
        }
        n = n.nextSibling;
      }
      Gantt.buildWorkload(index);
    });
    $('.ganttSlider').css('background-image', 'url('+chrome.extension.getURL("bg2.gif")+')');
  }  
}

Gantt.setToday();



function saveDate(_this) {
  var id = $(_this).attr('title');

  var margin = parseInt($(_this).css('margin-left'));
  var width = parseInt($(_this).css('width'));
  var start = Math.round(margin / dayWidth);
  var days = Math.round(width / dayWidth);
  var startDate = new Date(Gantt.date.getTime() + ((start) * Gantt.view.day.ms));
  //var endDate = new Date(Gantt.date.getTime() + ((start + days - 1 ) *  Gantt.view.day.ms));
  
  var effort = 0;
  for(var i = 0;i<days;i++) {
    var now = new Date(startDate.getTime() + (i * Gantt.view.day.ms));
    if(testDay(now)){
      effort += Gantt.view.day.effort;
    } 
  }
  console.log(effort);




  var startDateString = dayString(startDate);
  //var endDateString = dayString(endDate);

  var url = '/issues/'+id+'.json';
  $.ajax({
    type: 'GET',
    url: url, 
    success: function(data) { 
      data.issue.start_date = startDateString;
      //data.issue.due_date = endDateString;
      data.issue.estimated_hours = effort;
      $.ajax({
        type: 'PUT',
        url: url,
        data: data, 
        success: function() { },
        complete : function() { 
          document.location = "/projects/safefqwefqwedfasd/issues?query_id=300";
         }
      });
    }

  });
}




