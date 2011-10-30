


/* Darstellungsvariablen
var dayWidth = 40;
var effortADay = 8;
var aDay = 86400000;

var current = null;
var currentM = null;
var startX = 0;
var currentX = 0;
var currentW = 0;
var slide = true;
 */




function item(_this,_evt) {
  this.current = $(_this);
  this.margin = parseInt(this.current.css('margin-left'));
  this.width = parseInt(this.current.css('width'));
  this.type =  null,
  this.mouse = {
    start : _evt.clientX,
    current : _evt.clientX
  };
  this.updateMargin = function(_evt) {
    this.margin = (this.margin + _evt.clientX - this.mouse.current );
    this.mouse.current = _evt.clientX;
    return this.margin;
  };
  this.updateWidth = function(_evt) {
    this.width = (this.width + _evt.clientX - this.mouse.current );
    this.mouse.current = _evt.clientX;
    return this.width;
  }
}


Gantt = {

  date : null,
  time : null,
  day : null,
  item : null,
  groups : [],
  tasks : [],
  holiday : ['2011-11-01'],
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

    $('#gs'+_index+' .ganttDate').find('.gdi0').css('margin-left',marginleft+'px');
    var bg = 'url('+chrome.extension.getURL("bg2.gif")+') '+marginleft+'px 0 repeat';
    for(var i = 0; i< 30; i++) {
      var t = this.time + (i*this.view.day.ms);
      if(this.holiday[t]) {
        var marginleft = i * this.view.day.width;
        bg += ', url('+chrome.extension.getURL("bg3.gif")+') '+marginleft+'px 0 repeat-y';
      }
    }
    $('#gs'+_index).css('background',bg);
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
    this.tasks[g.id] = g;
    this.groups[_gindex].tasks.push(this.tasks[g.id]);
    this.showTask(_gindex,this.groups[_gindex].tasks.length-1);
  },
  showTask : function(_gindex,_tindex) {
    var t = this.groups[_gindex].tasks[_tindex];
    $('#gs'+_gindex).append(this.htmlTask(t));
  },
  htmlTask : function(_t) {

    _t.day = [];
    var j = 0;
    var d = 0;
    while(d<_t.days()) {
      var now = (_t.start + (j * Gantt.view.day.ms));
      if(testDay(now)){
        _t.day[now] = 1;
        d++;
      } else {
        _t.day[now] = 0;
      }
      _t.day.length++;
      j++;
    }


    var task = '<div class="ganttTask" id="gt'+_t.id+'" title="'+_t.id+'" style="margin-left: ';
    task += (Gantt.view.day.width*getTimeDiff(Gantt.time,_t.start))+'px; width: '+((Gantt.view.day.width*_t.day.length)-5)+'px">'+_t.subject+'</div>';
    task += '<div class="ganttPoint" id="gp'+_t.id+'" title="'+_t.id+'" style="margin-left: '+((Gantt.view.day.width*getTimeDiff(Gantt.time,_t.end)))+'px;"></div>';
    return task;
  },
  buildWorkload : function(_gindex) {
    var g = this.groups[_gindex];
    g.workload = [];
    for(var i = 0; i< g.tasks.length; i++) {
      for(var n in g.tasks[i].day) {
        var wl = g.workload[n];
        if(wl===undefined) {wl = g.tasks[i].day[n]} else { wl += g.tasks[i].day[n]; }
        g.workload[n] = wl;
      }
    }
    $('#gs'+_gindex+' .ganttDayItem').remove();
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
    
  },
  init : function() {
    //compile holidays
    for(var i = 0; i < this.holiday.length;i++) {
      this.holiday[new Date(this.holiday[i]).getTime()] = true;
    }
  }
}
Gantt.init();
Gantt.setToday();



function saveDate(_this,_type) {
  var id = $(_this).attr('title');
  var org = jQuery.extend({}, Gantt.tasks[id]);

  var margin = parseInt($(_this).css('margin-left'));
  var width = parseInt($(_this).css('width'));
  var start = Math.round(margin / Gantt.view.day.width);
  var days = Math.round(width / Gantt.view.day.width);
  var date = new Date(Gantt.date.getTime() + ((start) * Gantt.view.day.ms));


  var dateString = dayString(date);
  var effort = 0;
  for(var i = 0;i<days;i++) {
    var now = new Date(date.getTime() + (i * Gantt.view.day.ms));
    if(testDay(now.getTime())){
      effort += Gantt.view.day.effort;
    }
  }
  
  var url = '/issues/'+id+'.json';
  $.ajax({
    type: 'GET',
    url: url, 
    success: function(data) { 
      var t = Gantt.tasks[id];
      switch(_type) {
        case 'start':
          t.start = new Date(dateString).getTime();
          data.issue.start_date = dateString;
          break;
        case 'effort':
          t.effort = effort;
          data.issue.estimated_hours = effort;
          break;
        case 'end':
          t.end = new Date(dateString).getTime();
          data.issue.due_date = dateString;
          break;
      }
      $.ajax({
        type: 'PUT',
        url: url,
        data: data, 
        success: function() { 
          $('#gp'+id).remove();
          $('#gt'+id).replaceWith(Gantt.htmlTask(t));
            $('.group').each(function(index){
              Gantt.buildWorkload(index);
            });
        },
        error : function(_e){
          if(_e.status == 200) {
            $('#gp'+id).remove();
            $('#gt'+id).replaceWith(Gantt.htmlTask(t));

            $('.group').each(function(index){
              Gantt.buildWorkload(index);
            });
          } else {
            alert('fehler beim speichern. :(');
            Gantt.tasks[id] = org;
            $('#gp'+id).remove();
            $('#gt'+id).replaceWith(Gantt.htmlTask(org));
          }
        },
        complete : function() {
          //document.location = "/projects/safefqwefqwedfasd/issues?query_id=300";
         }
      });
    }

  });
}




