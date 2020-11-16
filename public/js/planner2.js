/* ISSUE: auto hide search panel for narrow screens */
/* get tba period details - allow edit period **/
/* save - tba period details (venue, period..)*/
/* course search panel: too long text */
var courses_dict = []; //in use
var courses_selected = [];

var num_courses_in_table = 20;

var period_types = ['ASB', 'CLW', 'DIS', 'EXR', 'FLD', 'IND', 'LAB', 'LEC', 'PRA', 'PRJ', 'SEM', 'STD', 'STO', 'TUT', 'VST', 'WBL', 'WKS']; //in use
var max_length_english = 30;
var max_length_chinese = 19;
var max_length_prof = 17;

var total_units = 0;
var color_picker; //in use

var hide_panel_timer; //instance for setTimeout //in use
var hide_color_timer; //instance for setTimeout //in use
var show_info_panel_disabled = false;
var timetable; //for saved timetable information

function init(){
  $("coursecode_key_id").defaultText("ugfn1000,acct21,ugea21,phed101,gecc1000", "input-text-default");
  $('course-data-table').observe('mouseout', unhighlight_course);
  color_picker = new jscolor.color($('color-editor'));
  $('color-editor').observe('change', change_course_color_evt);
  $('set-color').observe('mouseover', function(evt){
    deactivate_hide_color_timer(0);
    $('color-editor').color.showPicker();
    $('color-picker-instance').stopObserving();
    $('color-picker-instance').observe('mouseenter', function(evt){
      deactivate_hide_color_timer();
      deactivate_hide_info_panel_timer(0);
    });
    $('color-picker-instance').observe('mouseleave', function(evt){
      hide_info_panel(0);
      hide_color_picker(0);
    });
  });
  $('set-color').observe('mouseleave', hide_color_picker);

  $('set-attend').observe('click', toggle_course_attendance);
  $('set-tba-period').observe('click', show_input_tba_period);
  $('set-tba-venue').observe('click', show_input_tba_venue);
  $('reset-tba').observe('click', reset_tba_period);
  $('tba-venue-submit').observe('click', update_tba_venue);
  $('tba-period-submit').observe('click', update_tba_period);
  $('tba-period-cancel').observe('click', hide_input_tba_period);
  $('tba-venue-cancel').observe('click', hide_input_tba_venue);
  $('set-remove').observe('click', remove_course_handler);
  $('info-panel').observe('mouseleave', function(evt){
    hide_info_panel(0);
  });
  $('info-panel').observe('mouseenter', function(evt){
    deactivate_hide_info_panel_timer(0);
  });
  $('info-panel').observe('mouseover', function(evt){
    deactivate_hide_info_panel_timer(0);
  });

//  create_droppable();

  if(timetable){
    timetable = timetable.evalJSON();
    load_timetable(timetable);
  }
}

function toggle_edit_timetable(){
  if($('toggle-edit-button').innerHTML == 'Preview') preview_timetable();
  else edit_timetable();
}

function preview_timetable(){
  $$('.tt-course').invoke("hide");
  $$('.cell').each(function(e){
    var courses_elements = e.getElementsBySelector('.tt-course');
    for(var i=0; i<courses_elements.length; i++){
      if(courses_elements[i].down('.tt-coursecode').hasClassName('not-attend')) continue;
      var coursecode_element = courses_elements[i].down('.tt-coursecode');
      coursecode_element.addClassName('tt-coursecode-preview');
      e.setStyle({backgroundColor: coursecode_element.getStyle('background-color'),
                  color: coursecode_element.getStyle('color')});
      courses_elements[i].down('.tt-type').hide();
      courses_elements[i].down('.tt-venue').show();
      courses_elements[i].show();
      break;
    }
  });
  $('period_00').setStyle({visibility: 'hidden'});
  $('toggle-edit-button').update('Edit Mode').setStyle({backgroundImage: "url('images/editor_edit.gif')"});;
  $('result_table').addClassName('preview');
  show_info_panel_disabled = true;
}

function edit_timetable(){
  $$('.tt-coursecode-preview').invoke("removeClassName", "tt-coursecode-preview");
  $$('.cell').each(function(e){ e.writeAttribute({style: ""}); });
  $$('.tt-type').invoke("show");
  $$('.tt-venue').invoke("hide");
  $$('.tt-course').invoke("show");
  $('period_00').setStyle({visibility: ''});
  $('toggle-edit-button').update('Preview').setStyle({backgroundImage: "url('images/editor_preview.gif')"});;
  $('result_table').removeClassName('preview');
  show_info_panel_disabled = false;
}

function update_units(){
  var total_units = 0;
  courses_selected.each(function(coursecode){
    total_units += parseInt(courses_dict[coursecode].unit);
  });
  $('current_units').update(total_units);
}

function get_timetable_details(){
  var courses = [];
  courses_selected.each(function(coursecode){
    var cid = courses_dict[coursecode].cid;
    var color = get_coursecode_color(coursecode);
    courses[cid] = courses_dict[coursecode];
    courses[cid].color = color;
    for(var i=0; i<courses[cid].periods.length; i++){
      var elements = $$('.'+coursecode+'-'+i);
//      if(elements[0].hasClassName('draggable')) courses[cid].periods[i].tba_period = get_tba_period_details(elements);
      courses[cid].periods[i].is_attend = !elements[0].down().hasClassName('not-attend');
    }
  });
  return {year: year, term: term, courses: courses};
}

function get_tba_period_details(elements){
  var day = to_char(get_day_from_cell_element(elements[0].up()));
  var start = get_period_from_cell_element(elements[0].up());
  var end = start;
  var venue = $('venue-' + elements[0].readAttribute('id')).innerHTML;
  for(var i=1; i<elements.length; i++){
    var extend_period = get_period_from_cell_element(elements[i].up());
    start = Math.min(start, extend_period);
    end = Math.max(end, extend_period);
  }
  return {day: day, start: start, end: end, venue: venue};
}

function load_timetable(t){
  if(!t) return ;
  $('loading-screen').show();
  var coursecodes = get_coursecodes(t.courses);
  $('coursecode_key_id').value = coursecodes.join(" ");
  course_search(load_courses_to_timetable);
  $('loading-screen').hide();
}

function get_coursecodes(courses){
  var ret = [];
  courses.each(function(c){ ret.push(c.coursecode); });
  return ret;
}

function load_courses_to_timetable(){
  timetable.courses.each(function(c){ 
    add_course(c.coursecode, false);
    change_course_color(c.coursecode, c.color, "", false);
    c.periods.each(function(p, index){
      if(p.necessity=="0") $$('.'+c.coursecode+'-'+index + ' .tt-coursecode').invoke("addClassName", "not-attend");
      if(p.tid != -1){
        for(var i=0; i<courses_dict[c.coursecode].periods.length && courses_dict[c.coursecode].periods[i].pid != p.pid; i++);
        if(i!=courses_dict[c.coursecode].periods.length){
          $(c.coursecode + '-' + i + "_" + '0').down('.tt-coursecode').simulate('mouseover');
          $('venue-input').value = p.venue;
          $('day-input').value = p.day;
          $('start-input').value = p.start;
          $('end-input').value = p.end;
          update_tba_venue();
          update_tba_period();
        }
      }
    });
  });
}


function course_period_search(callback){
  var day = $('course_day_id').value;
  var period = $('course_period_id').value;
  if(day==null || period== null){
    alert("Please fill in both day and period!");
    focus_field("course_day_id");
    return ;
  }
  current_search_coursecode = day + period;
  new Ajax.Request('/ajax_planner2_get_course_by_period.php',
  {
    method: 'get',
    parameters: {'year': year, 'term': term, 'day': day, 'period': period, 'mode': "time"},
    onSuccess: course_search_show,
    onLoading: function(){ if(!loaded) $('loading_panel').show(); else $('loading_panel').hide(); },
    onComplete: function(){ loaded = true; $('loading_panel').hide(); },
    onFailure: function(){ alert('Internal Server Error! Please Try Again Later!'); }
  });
}

function course_search(callback){
  var key = $('coursecode_key_id').value;
  if(key.match(/^[0-9A-Za-z ,]+/)==null){
    alert("Invalid Coursecode!");
    focus_field("coursecode_key_id");
    return ;
  }
  current_search_coursecode = key;
  new Ajax.Request('/ajax_planner2_get_course.php',
  {
    method: 'get',
    parameters: {'year': year, 'term': term, 'key': key, 'mode': "code"},
    onSuccess: course_search_show,
    onLoading: function(){ if(!loaded) $('loading_panel').show(); else $('loading_panel').hide(); },
    onComplete: function(){ loaded = true; $('loading_panel').hide(); },
    onFailure: function(){ alert('Internal Server Error! Please Try Again Later!'); }
  });
//  focus_field("coursecode_key_id");
}

function course_search_show(transport){
  var data = transport.responseText.evalJSON();
  if(!data.courses || data.courses.length == 0){
    alert("No courses found!");
    return ;
  }
  $$('#course-data-table tr').each(function(e){ e.remove(); });
  data.courses.each(function(c){
    var backup_tba_periods = [];
    if(courses_dict[c.coursecode] != null){
      for(var i=0; i<courses_dict[c.coursecode].periods.length; i++){
        if(courses_dict[c.coursecode].periods[i].tba_period != null){
          backup_tba_periods.push({index: i,
                pid: courses_dict[c.coursecode].periods[i].pid,
                tba_period: courses_dict[c.coursecode].periods[i].tba_period});
        }
      }
    }
    courses_dict[c.coursecode] = c;
    for(var i=0; i<courses_dict[c.coursecode].periods.length; i++){
      if(courses_dict[c.coursecode].periods[i].day != "Z") continue;
      for(var j=0; j<backup_tba_periods.length; j++){
        if(backup_tba_periods[j].pid == courses_dict[c.coursecode].periods[i].pid){
          courses_dict[c.coursecode].periods[i].tba_period = backup_tba_periods[j].tba_period;
        }
      }
    }
    var el_coursecode = new Element('td').update(c.coursecode);
    var el_coursename = new Element('td').update(c.coursename);
    var el_prof = new Element('td').update(c.prof.join(", "));
    var el_unit = new Element('td', {"class": "planner-unit"}).update(c.unit);
    var el_row = new Element('tr', {'id': 'row-' + c.coursecode, 'class': 'row-' + ($("course-data-table").childElements().length % 2)});
    if(is_course_added(c.coursecode)) el_row.addClassName('selected');
    el_row.observe('mouseover', highlight_course);
    el_row.observe('click', toggle_course);
    [el_coursecode, el_coursename, el_prof, el_unit].each(function(e){ el_row.appendChild(e); });
    $('course-data-table').appendChild(el_row);
  });
  if(load_timetable_flag){/* ISSUE bad practice! */
    load_courses_to_timetable();
    load_timetable_flag = false;
  }
}
function is_course_added(coursecode){
  return $$('.'+coursecode).length > 0;
}

function highlight_course_period(coursecode, period_index){
  var p = courses_dict[coursecode].periods[period_index];
  for(var i=parseInt(p.start); i<=parseInt(p.end); i++){
    $('period_' + to_num(p.day) + i).addClassName('highlighted');
    $('period_' + to_num(p.day) + i).addClassName('lesson-' + get_type(p.type));
  }
}
function unhighlight_course_period(coursecode, period_index){
  var p = courses_dict[coursecode].periods[period_index];
  for(var i=parseInt(p.start); i<=parseInt(p.end); i++){
    $('period_' + to_num(p.day) + i).removeClassName('highlighted');
    $('period_' + to_num(p.day) + i).removeClassName('lesson-' + get_type(p.type));
  }
}
function highlight_course(evt){
  unhighlight_course();
  var coursecode = find_coursecode_from_search_evt(evt);
  var course_info = courses_dict[coursecode];
  course_info.periods.each(function(p){
    var day = to_num(p.day);
    var start = parseInt(p.start);
    var end = parseInt(p.end);
    if(p.tba_period != null){
      day = to_num(p.tba_period.day);
      start = parseInt(p.tba_period.start);
      end = parseInt(p.tba_period.end);
    }
    for(var i=start; i<=end; i++){
      $('period_' + day + i).addClassName('highlighted');
      $('period_' + day + i).addClassName('lesson-' + get_type(p.type));
    }
  });
}

function unhighlight_course(){
  $$('.highlighted').each(function(e){ e.removeClassName('highlighted'); });
  period_types.each(function(type){
    $$('td.lesson-' + type).each(function(e){ e.removeClassName('lesson-' + type); });
  });
}

function toggle_course(evt){
  var coursecode = find_coursecode_from_search_evt(evt);
  if(coursecode_added(coursecode)){ /* ISSUE: how about Z0 periods? */
    remove_course(coursecode, true);
  }else{
    add_course(coursecode, true);
  }
}

function add_period_observers(element){
  element.observe('mouseover', show_info_panel).observe('mouseleave', hide_info_panel);
  return element;
}

function add_course(coursecode, is_log_history){
  var course_info = courses_dict[coursecode];
  var bg_color = get_bg_color();
  var fg_color = fg_from_bg(bg_color);
  var coursecode_style = {backgroundColor: '#'+bg_color, color: '#'+fg_color};
  course_info.periods.each(function(p, index){
    for(var i=parseInt(p.start); i<=parseInt(p.end); i++){
      var id = coursecode + "-" + index + "_" + (i-parseInt(p.start));
      var e = new Element('div', {'class': ["tt-course", coursecode, coursecode+"-"+index].join(" "), 'id': id});
      var element_container = add_period_observers(new Element('div', {'class': "tt-coursecode"}).setStyle(coursecode_style).update(coursecode));
      e.appendChild(element_container);
      e.appendChild(new Element('div', {'class': ["tt-type", 'tt-lesson-'+get_type(p.type)].join(" ")}).update(get_type(p.type)));
      e.appendChild(new Element('div', {'class': "tt-venue", 'style': 'display: none;'}).update("(<span id='venue-" + id + "'>"+p.venue+"</span>)"));
      e.appendChild(new Element('div', {'class': "clear"}));
      if(to_num(p.day)==0 && i==0) create_draggable(e);
      $('period_' + to_num(p.day) + i).appendChild(e);
    }
  });
  $('row-' + coursecode).addClassName('selected');
  courses_selected.push(coursecode);
  update_units();
  if(is_log_history) undo_history.add({coursecode: coursecode, action: 'add', color: bg_color});
}

function get_period_class_name(e){
  var ret = '';
  e.readAttribute('class').split(' ').each(function(class_name){ if(class_name.indexOf("-")>=7) ret = class_name; });
  return ret;
}

function create_draggable(element){
  new Draggable(element, {
    revert: true,
    ghosting: true,
    onStart: function(){
      show_info_panel_disabled = true;
      $('info-panel').hide();
    },
    onDrag: function(draggable, evt){
      $$('.cell').each(function(e){
        if(is_overlap(Event.findElement(evt), e)) e.addClassName('highlighted');
        else e.removeClassName('highlighted');
      });
    },
    onEnd:function(draggable, evt){
      var info_panel_element = $('info-panel');
      var period_class = get_period_class_name(draggable.element);
      period_elements = $$('#result_table .highlighted');
      if(period_elements.length == 0){
        period_elements = [draggable.element.up()];
        draggable.element.remove();
      }else $$('.'+period_class).invoke("remove");

      var tba_info = get_period_info_from_elements(period_elements);
      var coursecode = get_coursecode_from_course_element(draggable.element);
      var period_index = get_period_index_from_course_element(draggable.element);
      set_tba_period(coursecode, period_index, tba_info);
      update_tba_period_position(draggable.element, period_elements);
      $$('.'+period_class+' .tt-coursecode')[0].insert({after: info_panel_element});
      info_panel_update_info(coursecode);
      show_info_panel_disabled = false;
      show_input_tba_venue(null);
    }
  });
  element.addClassName('draggable');
}
function is_overlap(a, b){
  var a_pos = a.cumulativeOffset();
  var a_size= a.getDimensions();
  var b_pos = b.cumulativeOffset();
  var b_size= b.getDimensions();
  var container_scroll = $('right_panel').cumulativeScrollOffset().top; // add the scroll offset to cater for difference between event pos and td pos
  return ((a_pos.left+a_size.width>=b_pos.left && a_pos.left+a_size.width<=b_pos.left+b_size.width) ||
          (a_pos.left             >=b_pos.left && a_pos.left             <=b_pos.left+b_size.width)
         ) //a across b
         &&
         ((a_pos.top+container_scroll+a_size.height>=b_pos.top  && a_pos.top+container_scroll+a_size.height<=b_pos.top +b_size.height) ||
          (a_pos.top+container_scroll              >=b_pos.top  && a_pos.top+container_scroll              <=b_pos.top +b_size.height)
         ) //b across a
         &&
         (a_pos.left+a_size.width/2>=b_pos.left && a_pos.left+a_size.width/2<=b_pos.left+b_size.width)
         ; //not allowing overlapping two different days: only count if they overlap for more than half

}

function get_period_info_from_elements(elements){
  var day = to_char(get_day_from_cell_element(elements[0]));
  var start = get_period_from_cell_element(elements[0]);
  var end = start;
  for(var i=1; i<elements.length; i++){
    var period_num = get_period_from_cell_element(elements[i]);
    if(period_num < start) start = period_num;
    if(period_num > end) end = period_num;
  }
  return {day: day, start: start, end: end};
}

function deactivate_hide_color_timer(evt){
  clearTimeout(hide_color_timer);
}
function deactivate_hide_info_panel_timer(evt){
  clearTimeout(hide_panel_timer);
}
function show_info_panel(evt){
  if(show_info_panel_disabled) return ;
  deactivate_hide_info_panel_timer(0);
  if(color_picker_in_use()) return ;
  info_panel_init_pos(this, this.up().hasClassName('draggable')?"relative":"absolute", $('right_panel').scrollTop, (get_day_from_cell_element(this.up(".cell"))>3?120:0));
  info_panel_reappend(this);
  info_panel_init_attending(this);
  info_panel_init_color(this);
  var coursecode = find_coursecode_from_info_panel();
  info_panel_update_info(coursecode);
  info_panel_init_venue();
  hide_input_tba_venue(null);
  hide_input_tba_period(null);
  hide_tba_error();
  this.up().hasClassName('draggable') ? show_tba_buttons() : hide_tba_buttons();
  $('info-panel').show();
  Event.stop(evt); //necessary??
}
function hide_tba_error(){
  $('tba-period-error').hide();
}
function is_tba_period(coursecode, period_id){
  return courses_dict[coursecode].periods[period_id].day == "Z";
}
function disable_draggable_relative_style(element){
  if(element.up().hasClassName('draggable')){
    element.up().setStyle({position: 'absolute'});
  }
}
function color_picker_in_use(){
  var element = $('color-picker-instance');
  return element != null && element.visible();
}
function info_panel_init_pos(source_element, css_position /* absolute/relative */, scroll_offset_top, scroll_offset_left){
  var pos = source_element.cumulativeOffset();
  var style_left = css_position == "absolute" ? ((pos.left-scroll_offset_left) + 'px') : ((-scroll_offset_left) + 'px');
  var style_top  = (source_element.getHeight() + (css_position=="absolute"?pos.top-scroll_offset_top:0)) +'px';
  $('info-panel').setStyle({left: style_left, top: style_top});
}
function info_panel_reappend(source_element){
  var panel_element = $('info-panel');
  panel_element.remove();
  source_element.insert({after: panel_element});
}
function info_panel_init_attending(source_element){
  var attending = !source_element.hasClassName('not-attend');
  $('set-attend').update(attending?"Attending":"Not attending");
}
function info_panel_init_venue(){
  $('info-venue').show();
  $('venue-input').hide();
}
function get_day_from_cell_element(element){
  return parseInt(element.readAttribute('id').substr(7, 1));
}
function get_period_from_cell_element(element){
  return parseInt(element.readAttribute('id').substr(8));
}
function info_panel_init_color(source_element){
  var day = get_day_from_cell_element(source_element.up());
  $('color-editor').writeAttribute({'class': "color {pickerPosition: '" + ((day==0 || day>=4)?'left':'right') + "'}"});
  var existing_color = parse_bg_color(source_element.getStyle('background-color'));
  color_picker.fromString(existing_color);
  $('color-editor').color.fromString(existing_color);
  var style = {backgroundColor: '#'+existing_color, color: '#'+fg_from_bg(existing_color)};
  $('info-coursecode').setStyle(style);
}
function info_panel_update_info(coursecode){
  var course_info = courses_dict[coursecode];
  var period_id = find_period_index($('info-panel').up(), coursecode);
  if(is_tba_period(coursecode, period_id)){
    var tba_obj = course_info.periods[period_id].tba_period;
    if(tba_obj != null){
      venue = tba_obj.venue;
      day = tba_obj.day;
      start = tba_obj.start;
      end = tba_obj.end;
    }else{
      venue = "TBA"; day="Z"; start=0; end=0;
    }
    $('info-venue').update(venue);
    $('info-day').update(day);
    $('info-start').update(start);
    $('info-end').update(end);
    $('venue-input').setValue(venue);
    $('day-input').setValue(day);
    $('start-input').setValue(start);
    $('end-input').setValue(end);
  }
  $('info-coursecode').update(coursecode);
  $('info-period').update(get_period_info_string(course_info, period_id));
  $('info-course').update(get_course_info_string(course_info));
//  $('info-venue').update($('venue-' + $('info-panel').up().readAttribute('id')).innerHTML);
}
function get_period_info_string(c, period_index){
  var strs = [];
  c.periods.each(function(p, index){
    if(p.tba_period){
      str = "TBA: " + p.tba_period.day + p.tba_period.start + (p.tba_period.start==p.tba_period.end?"":"-"+p.tba_period.end) + " @ " + p.tba_period.venue + " (" + p.lang + ")" + " <span class='info-type-tooltip'>(" + p.type + ")</span>";
    }else{
      str = p.day + p.start + (p.start==p.end?"":"-"+p.end) + " @ " + p.venue + " (" + p.lang + ")" + " <span class='info-type-tooltip'>(" + p.type + ")</span>";
    }
    var class_str = (index==period_index?" class='current-period'":"");
    var onmouseover_str = " onmouseover='highlight_course_period(\"" + c.coursecode + "\", " + index + ")'";
    var onmouseout_str = " onmouseout='unhighlight_course_period(\"" + c.coursecode + "\", " + index + ")'";
    str = "<span"+class_str+onmouseover_str+onmouseout_str+">" + str + "</span>";
    strs.push(str);
  });
  return strs.join("<br />");
}
function get_course_info_string(c){
  return [c.coursename, c.coursenamec, c.prof.join(", "),
          c.unit + " Units"].join("<br />");
}
function remove_course_handler(evt){
  var coursecode = find_coursecode_from_info_panel();
  remove_course(coursecode, true);
}
function toggle_course_attendance(evt){
  var coursecode = find_coursecode_from_info_panel();
  var period_id = find_period_index($('info-panel').up(), coursecode);
  $$('.'+coursecode+'-'+period_id + ' .tt-coursecode').invoke('toggleClassName', 'not-attend');
  $('set-attend').update($('info-panel').previous().hasClassName('not-attend')?"Not attending":"Attending");
  undo_history.add({coursecode: coursecode, period_index: period_id, action: "attend"});
}
function show_tba_buttons(){
  $('set-tba-period').show();
  $('set-tba-venue').show();
  $('reset-tba').show();
}
function hide_tba_buttons(){
  $('set-tba-period').hide();
  $('set-tba-venue').hide();
  $('reset-tba').hide();
}
function reset_tba_period(evt){
  $('venue-input').value = "TBA";
  $('day-input').value = "Z";
  $('start-input').value = "0";
  $('end-input').value = "0";
  update_tba_venue();
  update_tba_period();
}
function shown_input_tba_period(){
  return $('day-input').visible();
}
function show_input_tba_period(evt){
  if(shown_input_tba_period()) return ;
  var coursecode = find_coursecode_from_info_panel();
  if(!$('info-panel').up(0).hasClassName('draggable')){
/* ISSUE: show message: not editable? */
    return ;
  }
  $('day-input').value = $('info-day').innerHTML;
  $('info-day').hide();
  $('day-input').show();
  $('start-input').value = $('info-start').innerHTML;
  $('info-start').hide();
  $('start-input').show();
  $('end-input').value = $('info-end').innerHTML;
  $('info-end').hide();
  $('end-input').show();
  $('tba-period-submit').show();
  $('tba-period-cancel').show();
  $('day-input').focus();
}
function shown_input_tba_venue(){
  return $('venue-input').visible();
}
function show_input_tba_venue(evt){
  if(shown_input_tba_venue()) return ;
  var coursecode = find_coursecode_from_info_panel();
  if(!$('info-panel').up(0).hasClassName('draggable')){
/* ISSUE: show message: not editable? */
    return ;
  }
  $('venue-input').value = $('info-venue').innerHTML;
  $('info-venue').hide();
  $('venue-input').show();
  $('tba-venue-submit').show();
  $('tba-venue-cancel').show();
  $('venue-input').focus();
}
function hide_input_tba_venue(evt){
  $('info-venue').show();
  $('venue-input').hide();
  $('tba-venue-submit').hide();
  $('tba-venue-cancel').hide();
  if(evt != null) evt.stop();
}
function hide_input_tba_period(evt){
  $('info-day').show();
  $('day-input').hide();
  $('info-start').show();
  $('start-input').hide();
  $('info-end').show();
  $('end-input').hide();
  $('tba-period-submit').hide();
  $('tba-period-cancel').hide();
  if(evt != null) evt.stop();
}

function set_tba_period(coursecode, period_index, tba_info){
  var tba_obj = courses_dict[coursecode].periods[period_index].tba_period;
  if(tba_obj == null){
    courses_dict[coursecode].periods[period_index].tba_period = {day: tba_info.day, start: tba_info.start, end: tba_info.end, venue: "TBA"};
  }else{
    if(tba_obj.venue == null) courses_dict[coursecode].periods[period_index].tba_period.venue = "TBA";
    courses_dict[coursecode].periods[period_index].tba_period.day = tba_info.day;
    courses_dict[coursecode].periods[period_index].tba_period.start = tba_info.start;
    courses_dict[coursecode].periods[period_index].tba_period.end = tba_info.end;
  }
}
 
function update_tba_venue(evt){
  var coursecode = find_coursecode_from_info_panel();
  var period_id = find_period_index($('info-panel').up(), coursecode);
  var venue = $('venue-input').value;
  var period_obj = courses_dict[coursecode].periods[period_id].tba_period;
  if(!period_obj){
    courses_dict[coursecode].periods[period_id].tba_period = {day: "Z", start: 0, end: 0, venue: venue};
  }else{
    courses_dict[coursecode].periods[period_id].tba_period.venue = venue;
    if(!period_obj.day){
      courses_dict[coursecode].periods[period_id].tba_period.day = "Z";
      courses_dict[coursecode].periods[period_id].tba_period.start = 0;
      courses_dict[coursecode].periods[period_id].tba_period.end = 0;
    }
  }
  $('info-venue').update(venue);
  $$('.'+coursecode+'-'+period_id + ' .tt-venue span').each(function(e){ e.update(venue); });
  hide_input_tba_venue(null);
  if(evt != null) evt.stop();
}
function update_tba_period(evt){
  var coursecode = find_coursecode_from_info_panel();
  var period_id = find_period_index($('info-panel').up(), coursecode);
  var day = $('day-input').value;
  var start = parseInt($('start-input').value);
  var end = parseInt($('end-input').value);
  var info_panel_element = $('info-panel');
  if(!validate_tba_period(day, start, end)){
    $('tba-period-error').update('Invalid period!').show();
    return ;
  }
  set_tba_period(coursecode, period_id, {day: day, start: start, end: end});
  var period_elements = get_period_elements(day, start, end);
  $('tba-period-error').hide();
  hide_input_tba_period(null);

  var period_class = coursecode + '-' + period_id;
  var original_element = $$('.'+period_class)[0];
  $$('.'+period_class).invoke("remove");
  update_tba_period_position(original_element, period_elements);
  $$('.'+period_class+' .tt-coursecode')[0].insert({after: info_panel_element});
  info_panel_update_info(coursecode);
  
  //TODO: implement notice of moving
}
function validate_tba_period(day, start, end){
  if(to_num(day)==null || start<=0 || start>15 || end<=0 || end>15 || start>end) return false;
  if (to_num(day) == 0) return false;
  return true;
}
function update_tba_period_position(draggable_element, period_elements){
  period_elements.each(function(e, index){
    var original_element_id = draggable_element.readAttribute('id');
    var new_element_id = original_element_id.substr(0, original_element_id.indexOf("_")>=0?original_element_id.indexOf("_"):original_element_id.length)+"_"+index;
    var new_element = draggable_element.clone(true).writeAttribute({id: new_element_id, style: ''});
    new_element.select(".tt-venue span")[0].writeAttribute({id: 'venue-' + new_element_id});
    new_element.select("div#info-panel").each(function(e){ e.remove(); });
    add_period_observers(new_element.down('.tt-coursecode'));
    create_draggable(new_element);
    e.appendChild(new_element);
    e.removeClassName('highlighted');
  });
}
function get_period_elements(day, start, end){
  elements = [];
  var daynum = to_num(day);
  for(var i = start; i<=end; i++){
    elements.push($('period_' + daynum + i));
  }
  return elements;
}

function find_period_index(element, coursecode){
  for(var i=0; i<100; i++){
    if(element.hasClassName(coursecode+"-"+i)) return i;
  }
  return -1;
}
function change_course_color_evt(evt){
  var coursecode = find_coursecode_from_info_panel();
  var color = $('color-editor').value;
  change_course_color(coursecode, color, get_coursecode_color(coursecode), true);
}
function change_course_color(coursecode, color, prev_color, is_log_history){
  var style = {backgroundColor: '#'+color, color: '#'+fg_from_bg(color)};
  $$('.'+coursecode+' .tt-coursecode').each(function(e){ e.setStyle(style); });
  $('info-coursecode').setStyle(style);
  if(is_log_history) undo_history.add({coursecode: coursecode, action: 'color', from_color: prev_color, to_color: color});
}
function hide_color_picker(evt){
  hide_color_timer = setTimeout(function(){ $('color-editor').color.hidePicker(); }, 300);
}
function hide_info_panel(evt){
//  hide_panel_timer = setTimeout(function(){ $('info-panel').hide(); }, 500);
  hide_panel_timer = setTimeout(hide_info_panel_handler, 500);
}
function hide_info_panel_handler(){
  var active_element = document.activeElement;
  if(active_element == $('day-input') || active_element == $('start-input') || active_element == $('end-input') || active_element == $('venue-input')){
    hide_panel_timer = setTimeout(hide_info_panel_handler, 500);
    return ;
  }
  $('info-panel').hide();
}

function remove_course(coursecode, is_log_history){
  var panel_element = $('info-panel');
  panel_element.remove();
  $$('body')[0].appendChild(panel_element);

  if(is_log_history) undo_history.add({coursecode: coursecode, action: 'remove', color: get_coursecode_color(coursecode)});

  $$('.'+coursecode).each(function(e){ e.remove(); });
  $$('#row-' + coursecode).each(function(e){ e.removeClassName('selected'); });
  $('info-panel').hide();
  courses_selected = courses_selected.without(coursecode);
  update_units();
}

function clear_all(){
  courses_selected.each(function(coursecode){
    remove_course(coursecode, true);
  });
}

function coursecode_added(coursecode){
  return $$('.' + coursecode).length>0;
}

function find_coursecode_from_search_evt(evt){ /* id of a table row is like "row-FINA4280" */
  return Event.findElement(evt, 'TR').readAttribute('id').substr(4);
}
function find_coursecode_from_tt_evt(evt){
  var id = Event.findElement(evt, 'DIV').readAttribute('id');
  return get_coursecode_from_course_element_id(id);
}
function get_coursecode_from_course_element_id(id){
  return id.substr(0, id.indexOf("-"));
}
function get_coursecode_from_course_element(e){
  var id = e.readAttribute('id');
  return id.substr(0, id.indexOf("-"));
}
function get_period_index_from_course_element(e){
  var id = e.readAttribute('id');
  return id.substr(id.indexOf("-")+1, id.indexOf("_")-id.indexOf("-")-1);
}
/* ISSUE: not used 
function get_period_index_from_course_element_id(id){
  return parseInt(id.substr(id.indexOf("-")+1));
}
*/
function find_coursecode_from_info_panel(){
  return $('info-panel').previous('.tt-coursecode').innerHTML;
}
function get_coursecode_color(coursecode){
  return parse_bg_color($$('.'+coursecode+' .tt-coursecode')[0].getStyle('background-color'));
}

var undo_history = {
  records: [],
  walker: -1,
  add : function(record){
          this.records= this.records.slice(0, this.walker+1);
          this.records.push(record);
          this.walker++;
          this.show_undo_button();
          this.hide_redo_button();
        },
  show_undo_button: function(){ $('undo-button').removeClassName('inactive'); },
  hide_undo_button: function(){ $('undo-button').addClassName('inactive'); },
  show_redo_button: function(){ $('redo-button').removeClassName('inactive'); },
  hide_redo_button: function(){ $('redo-button').addClassName('inactive'); },
  undo: function(){
    if(this.walker<0) return ;
    var record = this.records[this.walker--];
    var action = record.action;
    if(action=="add"){
      remove_course(record.coursecode, false);
    }else if(action=="remove"){
      add_course(record.coursecode, false);
      change_course_color(record.coursecode, record.color, "", false);
    }else if(action=="color"){
      change_course_color(record.coursecode, record.from_color, record.to_color, false);
    }else if(action=="attend"){
      $$('.' + record.coursecode + '-' + record.period_index + ' .tt-coursecode').invoke('toggleClassName', 'not-attend');
    }
    this.show_redo_button();
    if(this.walker<0) this.hide_undo_button();
  },
  redo: function(){
    if(this.records.length<=this.walker+1) return ;
    var record = this.records[++this.walker];
    var action = record.action;
    if(action=="add"){
      add_course(record.coursecode, false);
      change_course_color(record.coursecode, record.color, "", false);
    }else if(action=="remove"){
      remove_course(record.coursecode, false);
    }else if(action=="color"){
      change_course_color(record.coursecode, record.to_color, record.from_color, false);
    }else if(action=="attend"){
      $$('.' + record.coursecode + '-' + record.period_index + ' .tt-coursecode').invoke('toggleClassName', 'not-attend');
    }
    this.show_undo_button();
    if(this.walker+1==this.records.length) this.hide_redo_button();
  }
};

function to_num(c){
  var map = {'M': 1, 'T': 2, 'W': 3, 'H': 4, 'F': 5, 'S': 6, 'Z': 0};
  return map[c];
}
function to_char(day){
  var map = ['Z', 'M', 'T', 'W', 'H', 'F', 'S'];
  return map[day];
}

function get_type(full_type_str){
  return full_type_str.substr(0, 3);
}
function get_bg_color(){
  var random_number = (Math.floor(Math.random()*16777216)).toString(16);
  return ('0000000' + random_number).slice(-6);
}
function fg_from_bg(bg){
  var multipliers = [16*213.0/255, 213.0/255, 16*715.0/255, 715.0/255, 16*72.0/255, 72.0/255];
  var value = 0;
  for(var i=0; i<6; i++) value += parseInt(bg.charAt(i), 16)*multipliers[i];
  return value<650?"FFFFFF":"000000";
}

function parse_bg_color(color){
  if(!color || color=="transparent") return "FFFFFF";
  var c = new RGBColor(color);
  return c.toHex().substr(1);
}
