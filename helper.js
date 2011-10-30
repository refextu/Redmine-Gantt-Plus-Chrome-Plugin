
function testDay(_d) {
  var d = new Date(_d).getDay();
  if(Gantt.holiday[_d]) {
    return false;
  }
  switch(d) {
    case 0 : 
      return false;
    case 6 : 
      return false;
    default : 
      return true;
  }
}

function dayString(_d){
  var d = _d.getDate();
  if(d<10){ d = "0"+d; }
  var m = _d.getMonth()+1;
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