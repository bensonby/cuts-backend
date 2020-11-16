var ajax_obj = false;
var ajax_obj2 = false;
var ajax_objects = [];
var to_switch_year = false;
var to_switch_term = false;
var script_loaded = true;

var friends_current_highlight = false;
var friends_new_highlight = false;

var replacements = [];
var replacements_current = [];

function switch_term(year, term){
  to_switch_year = year;
  to_switch_term = term;
  new Ajax.Request('ajax_switch_term.php', {
    method: 'post',
    parameters: {year: year, term: term, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText;
      if(data=="1"){
        refresh_page();
      }else{
        //show_error("Failed to switch the term. Please try again later or contact CUTS administrator");
        switch_term_nonAjax(to_switch_year, to_switch_term);
      }
    },
    onFailure: show_error_dialog
  });
}

function switch_term_nonAjax(year, term){
  redirect(fb_host + "switch_term.php?url=" + encodeURIComponent(window.location.href) + "&year=" + year + "&term=" + term);
}

function refresh_page(){
  window.location.reload();
}

function hide_ani(id){
  var e = document.getElementById(id);
  if(e){
    e.hide();
  }  
}
function show_ani(id){
  var e = document.getElementById(id);
  if(e){
    e.show();
  }
}

function toggle_ani(id){
  var e = document.getElementById(id);
  if(e){
    e.toggle();
  }
}

function search_coursegroups_by_coursecode(coursecode){
  if(coursecode.length==0) return ;
  $('course-browser').show();
  $('course-browser-content').update('Loading...');
  new Ajax.Updater('course-browser-content', cuts_host + "ajax_search_coursegroups.php", {
    method: 'post',
    parameters: {
      value: coursecode,
      type: "coursecode",
      user_access_token: user_access_token,
      fb_sig_user: fb_sig_user
    }});
}

function search_coursegroups_by_major(maid){
  $('course-browser').show();
  $('course-browser-content').update("Loading...");

  new Ajax.Updater('course-browser-content', cuts_host + "ajax_search_coursegroups.php", {
    method: 'post',
    parameters: {
      value: maid,
      type: "major",
      user_access_token: user_access_token,
      fb_sig_user: fb_sig_user
    }});
}

function validate_courses(is_extra){
  inputs = $('id_coursecodes').value;
  new Ajax.Updater('validation-result', cuts_host + "ajax_validate_courses.php", {
    method: 'post',
    parameters: {
      coursecodes: inputs,
      is_extra: is_extra,
      user_access_token: user_access_token,
      fb_sig_user: fb_sig_user
    }});
}

function validate_coursegroups(){
  inputs = $('id_coursegroups').value;
  new Ajax.Updater('validation-result', cuts_host + "ajax_validate_coursegroups.php", {
    method: 'post',
    parameters: {
      coursegroups: inputs,
      year: year,
      term: term,
      user_access_token: user_access_token,
      fb_sig_user: fb_sig_user
    }});
}
function yourtt_init(){
  return ;
  var e = $('publish_feed_btn');
  if(!e) return ;
  e.observe('click', publish_feed);
}

function upload_init(){
  var element = $('id_coursecodes');
  if(element) element.observe('keyup', validate_courses_keyup_handler);
}
function register_init(){
  var e = $('id_color');
  if(e){
    var picker = new jscolor.color($('id_color'), '', 'color-container', 'bottom', []);
  }
}
function planner_init(){
  var e = $('add-courses-to-portfolio-hide-btn');
  if(e){
    e.observe('click', function(evt){
      $('add-courses-to-portfolio').toggle();
    });
  }else{
    return ;
  }
  $('course-profile-mode-btn').observe('click', course_profile_mode);
  $('planner-mode-btn').observe('click', planner_mode);
  $('find-course-btn').observe('click', function(evt){
    $('add-courses-to-portfolio').toggle();
  });
  if($('find-course-btn-add')){
    $('find-course-btn-add').observe('click', function(evt){
      $('add-courses-to-portfolio').toggle();
    });
  }
}

function friendstt_init(){
  var element = $('sorter');
  if(element) friends_sorter('sorter', 1, 'num');
  var e = $('timetable-filter-input');
  if(!e) return ;
  e.observe('keyup', filter_friends_tt);
  $('merge_tt_form').observe('submit', function(event){
    if($$('#friends-list input:checked').length < 1){
      alert("Please select some timetables (tick the checkboxes) to merge!");
      event.stop();
    }
  });
  $$('.show-timetable-link').invoke('observe', 'click', show_timetable_event);
  $$('.current_tt').each(function(e){
    var id = e.readAttribute('id');
    var tiid = id.substr(id.indexOf('_')+1);
    var uid = id.substr(id.indexOf('-')+1, id.indexOf('_')-id.indexOf('-')-1);
    show_timetable(uid, tiid);
  });
  /*
  if(fb_loaded){
    FB.api('/me/permissions', checkFriendListPermissions);
  }
  */
}

function mergeChecked() {
  var form = $('merge_tt_form');
  if(!form) return ;
  form.elements["fb_sig_user"].value = fb_sig_user;
  form.elements["user_access_token"].value = user_access_token;
  return true;
}

function checkFriendListPermissions(response) {
//  if(window.console) console.log("User permissions response", response);
  var data = response.data;
  for(var i=0; i<data.length; i++){
    if(data[i].permission != "user_friends") continue;
    if(data[i].status == "granted") return ;
  }
  //need to request permission
  if(!permission_request_sent){
    FB.login( function(response) { /*if(window.console) console.log(response);*/ }, {scope: 'user_friends', auth_type: 'rerequest'});
    permission_request_sent = true;
  }else{
    // alert("Please authorize CUTS to access your friend list for the best app experience");
  }
}

function statistics_init(){
  var element = $('users_by_major');
  if(element){
    stat_get_result("users_by_major");
  }
}

function settings_init(){
  var element = $('update-settings-button');
  if(!element) return ;
  element.observe('click', function(evt){
    evt.preventDefault();
    update_settings();
  });
  var form = $('settings-form');
  if(!form) return ;
  form.observe('submit', function(){ return false; });
}

function init(){
  yourtt_init();
  upload_init();
  register_init();
  planner_init();
  friendstt_init();
  statistics_init();
  settings_init();
}

function show_coursemates(cid, coursecode, year, term){
  $$('#friends-tt-info td div.yourtt-course').invoke('remove');
  $('coursemates-content').update("");
  $('list-coursemates-container').show();
  new Ajax.Request(cuts_host + "ajax_show_coursemates.php", {
        method: "post",
        parameters: {cid: cid, year: year, term: term, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
        onSuccess: function(transport){
                     $('coursemates-loading').hide();
                     $('coursemates-content').update(transport.responseText);
                   }
     });
  $('list-coursemates').show();
  $('coursemates-coursecode').update(coursecode);
  $('coursemates-loading').show();
  var coursemates_link = fb_host + "coursedb.php?coursecode="+coursecode+"&year="+year+"&term="+term;
  $('more-coursemates-link').setAttribute('href', coursemates_link);
}

function edit_mode(){
  var course_nodes = $$("#yourtt-courses-div div.yourtt-course");
  var myPicker = [];
  jscolor.init();
  for(var i = 0; i < course_nodes.length; i++){
    var e = course_nodes[i];
    var id = e.readAttribute('id');
    if(id == "") break;
    var cid = id.substr(id.lastIndexOf("-")+1);
    var e2 = $('color-' + cid);
    if(!e2) continue;
    e2.show();
    myPicker[i] = new jscolor.color($('color-' + cid), cid, "color-container-", 'left', []);
    var bgColor_css = e.childElements[0].getStyle('backgroundColor');
    var bgColor = css_colorstyle_to_str(bgColor_css);
    if(bgColor !== false) myPicker[i].fromString(bgColor);
    e.childElements[0].hide();
    for(var j = 0; ; j++){
      var e_period = $('checkbox-'+cid+'-'+j);
      if(!e_period) break;
      e_period.show();
    }
  }
  $("yourtt-edit-button").hide();
  $("yourtt-cancel-button").show();
  $("yourtt-save-button").show();
  $("yourtt-add-courses-button").show();
  $("yourtt-remove-courses-button").show();
}

function add_courses(){
  var remove_element = $('yourtt-remove-courses-panel');
  if(remove_element) remove_element.hide();
  var e = $('yourtt-add-courses-panel');
  if(!e) return ;
  if(e.getStyle('display')=='none'){
    show_ani('yourtt-add-courses-panel');
    var element = $('id_coursecodes');
    if(element) element.observe('keyup', validate_add_courses_keyup_handler);
  }else{
    e.hide();
  }
}

function remove_courses(){
  var add_element = $('yourtt-add-courses-panel');
  if(add_element) add_element.hide();
  var e = $('yourtt-remove-courses-panel');
  if(!e) return ;
  if(e.getStyle('display')=='none'){
    show_ani('yourtt-remove-courses-panel');
    var course_nodes = $("yourtt-courses-div div.yourtt-course");
    var insertNode = $("remove-courses-list");
    removeAllNodes(insertNode);
    for(var i = 0; i < course_nodes.length; i++){
      var e = course_nodes[i];
      var id = e.readAttribute('id');
      if(id == "") break;
      var cid = id.substr(id.lastIndexOf("-")+1);
      var coursecode = e.readAttribute('title');
      var newDiv = new Element('div');
      var input_el = new Element('input', {'type': 'checkbox', 'name': 'cids[]', 'value': cid});
      var span_el = new Element('span').update(coursecode);
      newDiv.appendChild(input_el);
      newDiv.appendChild(span_el);
      insertNode.appendChild(newDiv);
    }
  }else{
    e.hide();
  }
}

function removeAllNodes(e){
  var childs = e.childElements();
  for(var i = childs.length-1; i >= 0; i--){
    e.removeChild(childs[i]);
  }
}

function yourtt_set_color(cellPrefix, bgcolor, fgcolor){
  for(var i = 0; ; i++){
    var e = $(cellPrefix+i);
    if(!e) break;
    e.setStyle({backgroundColor: '#'+bgcolor});
    e.setStyle({color: '#'+fgcolor});
  }
  
}

function css_colorstyle_to_str(css){
  if(css.length == 7 && css.charAt(0) == '#') return css.substr(1);
  else if(css.substr(0, 4)=="rgb("){
    css = css.substr(css.indexOf('(')+1);
    css = css.substr(0, css.length - 1);
    var colors = css.split(', ');
    var color_value = parseInt(colors[0])*65536 + parseInt(colors[1])*256 + parseInt(colors[2]) + 16777216;
    return color_value.toString(16).substr(1);
  }else{
    return false;
  }
}

function delete_timetable(){ /* ISSUE */
  var prompt_str="Are you sure you want to remove your timetable from the database?";
  var dialog = new Dialog(Dialog.DIALOG_POP).showChoice('Remove Timetable', prompt_str, 'Delete');
  dialog.onconfirm = function(){ 
    document.getElementById("yourtt-delete-form").submit();
    return true;
  };
  return false;
}

function reset_customperiod_template(){
  for(var i=1; i<=14; i++){
    $("cell-M" + i).removeClassName("selected");
    $("cell-T" + i).removeClassName("selected");
    $("cell-W" + i).removeClassName("selected");
    $("cell-H" + i).removeClassName("selected");
    $("cell-F" + i).removeClassName("selected");
    $("cell-S" + i).removeClassName("selected");
  }
}

function edit_customperiod(coursecode, cid, pid){
  var element = $("yourtt-customperiod-edit");
  if(!element) return ;
  $("customperiod-coursecode").update(coursecode);
  $("customperiod-pid").value = pid;
  $("customperiod-cid").value = cid;
  reset_customperiod_template();
  element.show();

}
function set_customperiod_summary_str(pid, day, start, end, venue){
  var original_summary_str = $("input-summary-str-" + pid).value;
  if(day=="Z"){
    var str = "TSA";
  }else{
    var str = day + start;
    if(start != end) str = str + " - " + day + end;
  }
  str = str + " @ " + venue;
  var new_summary_str = str + " " + original_summary_str.substr(original_summary_str.indexOf("("));
  $("summary-str-" + pid).update(new_summary_str);
  $("input-summary-str-" + pid).value = new_summary_str;
}
function clear_customperiod(tiid){
  var cid = $("customperiod-cid").value;
  var pid = $("customperiod-pid").value;

  new Ajax.Request('ajax_clear_customperiod.php', {
                    method: 'post',
                    parameters: {
                      tiid: tiid,
                      cid: cid,
                      pid: pid,
                      user_access_token: user_access_token,
                      fb_sig_user: fb_sig_user
                    },
                    onSuccess: function(transport){
                      $('customperiod-saving-loading').hide();
                      var d = transport.responseText.evalJSON();
                      if(d){
                        set_customperiod_summary_str(d.data.pid, "Z", 0, 0, "TSA");
                        cancel_customperiod(d.data.pid);
                        document.setLocation(fb_host + "yourtt.php"); /* ISSUE */
                      }else{
                        show_error("An error occurred while saving. Please try again later");
                      }
                    }
                  });
  $('customperiod-saving-loading').show();
/*
  if(ajax_obj) ajax_obj.abort();
  ajax_obj = new Ajax();
  ajax_obj.responseType = Ajax.JSON;
  ajax_obj.ondone = function(d){
    document.getElementById('customperiod-saving-loading').setStyle('display', 'none');
    if(d){
      set_customperiod_summary_str(d.data.pid, "Z", 0, 0, "TSA");
      cancel_customperiod(d.data.pid);
      document.setLocation(fb_host + "yourtt.php");
    }else{
      show_error("An error occurred while saving. Please try again later");
    }
  }
  document.getElementById('customperiod-saving-loading').setStyle('display', '');
  ajax_obj.post(cuts_host + "ajax_clear_customperiod.php", 
               {"tiid": tiid, "cid": cid, "pid": pid});
*/
}
function save_customperiod(tiid){
  var cid = $("customperiod-cid").value;
  var pid = $("customperiod-pid").value;
  var periods = periods_on();
  var venue = $("customperiod-venue").value;
  if(periods[0]=="Z"){
    show_error("No periods selected. Do you mean you want to 'Clear' this custom period?");
    return ;
  }
  if(venue == ""){
    show_error("Venue is empty! Failed to save custom period.");
    return ;
  }
  new Ajax.Request('ajax_set_customperiod.php', {
    method: 'post',
    parameters: {tiid: tiid, cid: cid, pid: pid,
                 day: periods[0], start: periods[1], end: periods[2], venue: venue,
                 user_access_token: user_access_token,
                 fb_sig_user: fb_sig_user
    },
    onSucess: function(transport){
                var d = transport.responseText.evalJSON();
                $('customperiod-saving-loading').hide();
                set_customperiod_summary_str(d.data.pid, d.data.day, d.data.start, d.data.end, d.data.venue);
                cancel_customperiod(d.data.pid);
                document.setLocation(fb_host + "yourtt.php"); /* ISSUE */
              }
  });
/*
  if(ajax_obj) ajax_obj.abort();
  ajax_obj = new Ajax();
  ajax_obj.responseType = Ajax.JSON;
  ajax_obj.ondone = function(d){
    if(d){
      document.getElementById('customperiod-saving-loading').setStyle('display', 'none');
      set_customperiod_summary_str(d.data.pid, d.data.day, d.data.start, d.data.end, d.data.venue);
      cancel_customperiod(d.data.pid);
      document.setLocation(fb_host + "yourtt.php");
    }else{
      show_error("An error occurred while saving. Please try again later");
    }
  }
*/
  $('customperiod-saving-loading').show();
/*
  ajax_obj.post(cuts_host + "ajax_set_customperiod.php", 
               {"tiid": tiid, "cid": cid, "pid": pid, "day": periods[0], "start": periods[1],
                "end": periods[2], "venue": venue});
*/

  //ajax request, on success = set_customperiod_summary_str and cancel edit mode
}
function cancel_customperiod(pid){
  var element = $("yourtt-customperiod-edit");
  if(!element) return ;
  element.hide();
}

function toggle_period(day, period){
  var element = $("cell-" + day + period);
  if(!element) return ;
  if(element.hasClassName("selected")){
    if(!period_is_on(day, period-1) || !period_is_on(day, period+1)) element.removeClassName("selected");
    else show_error("Cannot remove the period. The periods must be consecutive.");
  }else{
    if(period_is_on(day, period-1)) element.addClassName("selected");
    else if(period_is_on(day, period+1)) element.addClassName("selected");
    else if(!period_on()) element.addClassName("selected");
    else show_error("Cannot select the period. The periods must be consecutive.");
  }
}
function period_is_on(day, period){
  if(period<=0 || period>14) return false;
  var element = $("cell-" + day + period);
  if(!element) return false;
  if(element.hasClassName("selected")) return true;
  else return false;
}
function period_on(){
  for(var i=1; i<=14; i++){
    if(period_is_on("M", i)) return true;
    if(period_is_on("T", i)) return true;
    if(period_is_on("W", i)) return true;
    if(period_is_on("H", i)) return true;
    if(period_is_on("F", i)) return true;
    if(period_is_on("S", i)) return true;
  }
}
function periods_on(){
  var days = ["M", "T", "W", "H", "F", "S"];
  for(var i=0; i<6; i++){
    for(var j=1; j<=14; j++){
      if(period_is_on(days[i],j)){
        k = j;
        while(period_is_on(days[i], ++k));
        return [days[i], j, k-1];
      }
    }
  }
  return ["Z", 0, 0];
}

function friends_sorter(id, col, type){
  var tablenode = $(id);
  var records = tablenode.childElements();
  var dummy = $("dummy_row");
  var data = [];
  for(var i=0; i<records.length-1; i++){
    var nodes = records[i].childElements();
    if(!nodes[col]) continue;
    var value_id = nodes[col].readAttribute('id');
    var value = value_id.substr(value_id.indexOf("_")+1);
    if(type=="num") value = parseInt(value);
    data[i] = {value: value, id: records[i].readAttribute('id')};
  }
  if(type=="num") data.sort(sortByText); 
  else if(type=="text") data.sort(sortByText);
  else if(type=="grade") data.sort(sortByGrade);

  for(var i=0; i<data.length; i++){
    var node = $(data[i].id);
    var clonenode = node.cloneNode(true);
    clonenode.removeClassName("row-0");
    clonenode.removeClassName("row-1");
    clonenode.addClassName("row-" + (i%2));
    removed = tablenode.removeChild(node);
    tablenode.insertBefore(clonenode, dummy);
  }
  
  $$('.show-timetable-link').invoke('observe', 'click', show_timetable_event);
}

function sortByText(a, b){
  var x = a.value;
  var y = b.value;
  return ((x<y)?-1:((x>y)?1:0));
}

function sortByGrade(a, b){
  var grade_values = {'A': 1, 'A-': 2, 'B+': 3, 'B': 4, 'B-': 5, 'C+': 6, 'C': 7, 'C-': 8, 'D+': 9, 'D': 10, 'D-': 11, 'F': 12};
  var x = a.value;
  var y = b.value;
  x = (x==""?20:grade_values[x]);
  y = (y==""?20:grade_values[y]);
  return ((x<y)?-1:((x>y)?1:0));
}

function show_timetable_course_info(evt){
  var id = this.readAttribute('id');
  if(id == null) return ;
  var cid = id.split('-')[1];
  var to_show_element = $('yourtt-course-'+cid);
  if(to_show_element == null) return ;

  new dropliciousMenu();
  $$('div.yourtt-course').each(function(e){ e.hide(); });
  var positions = this.cumulativeOffset();
  var top = positions[1] > 400 ? positions[1]-72-to_show_element.getDimensions().height : positions[1]-32;
  to_show_element.show().addClassName('overlay').setStyle({left: '10px', top: top+'px'});
  to_show_element.removeClassName('hiding');
  to_show_element.stopObserving('mouseleave');

  to_show_element.stopObserving('mouseenter');
  to_show_element.observe('mouseenter', function(evt){
    if(this.hasClassName('hiding')) this.removeClassName('hiding');
  });

  to_show_element.observe('mouseleave', function(evt){
      this.addClassName('hiding');
      (function(element){
         if(element.hasClassName('hiding')){
           try{
             element.hide();
           }catch(e){
//             console.log("here222...");
           }
         }
      }).delay(0.5, this);
  });

  this.observe('mouseleave', function(evt){
    var id = this.readAttribute('id');
    if(id == null) return ;
    var cid = id.split('-')[1];
    var to_hide_element = $('yourtt-course-'+cid);
    if(to_hide_element == null) return ;
    to_hide_element.addClassName('hiding');
    (function(element){
      if(element.hasClassName('hiding')){
        try{
          element.hide();
        }catch(e){
//          console.log("here3...");
        }
      }
    }).delay(0.5, to_hide_element);
  });
}

function filter_friends_tt(evt){
  var keywords = this.value.split("[.\\s]+");
  $$('#friends-list tr').each(function(e){
    for(var i=0; i<keywords.length; i++){
      if(e.readAttribute('name').toLowerCase().indexOf(keywords[i].toLowerCase())==-1) break;
    }
    if(i==keywords.length) e.show();
    else e.hide();    
  });
}

function show_timetable_event(evt){
  var id = this.readAttribute('id');
  var tiid = id.substr(id.indexOf('_')+1);
  var uid = id.substr(id.indexOf('-')+1, id.indexOf('_')-id.indexOf('-')-1);
  show_timetable(uid, tiid);
}

function show_timetable(uid, tiid){
  friends_new_highlight = uid;

  new Ajax.Request('ajax_timetable_details.php', {
      method: 'post',
      parameters: {tiid: tiid, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
      onSuccess: function(transport){
        $('friends-tt-info-loading').hide();
        $('friends-tt-info').update(transport.responseText);
        if(friends_current_highlight){
          $('friend-row-' + friends_current_highlight).removeClassName('row-2');
        }
        $('friend-row-' + friends_new_highlight).addClassName('row-2');
        friends_current_highlight = friends_new_highlight;
        $$('#yourtt-courses-div div.yourtt-course').invoke('hide');
        
        $$('#yourtt-timetable-table td').each(function(e){
          e.observe('mouseover', show_timetable_course_info);
        });

      }
  });
  $('friends-tt-info-loading').show();
}

function publish_feed(tiid, coursecodes, units, year, term){
  var d = new Date();
  var summary_main   = "My " + year + " Term " + term + " timetable";
  var image_link = cuts_host + "timetable_image.php?tiid=" + tiid + "&time=" + d.getTime();
  var view_link = fb_host + "friendstt.php?tiid=" + tiid;
  var coursecode_str = coursecodes.join(" ");
  var summary_info   = "[" + units + " units, " + coursecodes.length + " courses]";
  FB.ui(
    {
     method: 'feed',
     name: summary_main,
     caption: summary_info,
     description: coursecode_str,
     link: view_link,
     picture: image_link
    },
    function(response) {
      if (response && response.post_id) {
//        alert('Post was published.');
      } else {
//        alert('Post was not published. Please try again later');
      }
    }
  );
return ;
  var attachment = {
    'media'   : [{'type': 'image', 'src': image_link, 'href': view_link}],
    'name'    : summary_main + " " + summary_info,
    'href'    : view_link,
    'caption' : coursecode_str
  };
  var action_links = [{ "text": "View Friends' timetable", "href": view_link}];
}

function stat_get_result(key){
  var params ={"facebook_sig_user": fuid, "fb_sig_appfriends": friends_list_str};
  new Ajax.Request('ajax_get_stat.php?var=' + key, {
    method: 'post',
    parameters: params,
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      stat_show_results(data);
    },
    onFailure: show_error_dialog
  });
}
function show_error_dialog(title, msg) {
  if(!msg) msg = 'A communication error has occurred. Please try reloading the page.';
  show_message('Oops', msg);
} 
function show_error(msg) {
  show_message('Oops', msg);
} 
function show_message(title, msg){ /* ISSUE */
  alert(msg);
//  dialog = new Dialog().showMessage(title, msg);
}

function stat_show_results(data){
  var rows = data["data"];
  var totals=[]; totals[0]="Total"; totals[1]=0; totals[2]=0;
  for(var i=0; i<rows.length; i++){
    var nodes = new Element("tr");
    var cells = stat_get_cells(data["key"], rows[i]);
    for(var j=0; j<cells.length; j++){
      var nodes2 = new Element('td').update(cells[j]);
      if(j!=0&&data["key"]=="users_stat") totals[j]+=parseInt(cells[j]);
      nodes.appendChild(nodes2);
    }
    $(data["key"] + "_body").appendChild(nodes);
  }
  if(data["key"]=="users_stat"){
    var nodes = new Element("tr");
    for(var i=0; i<3; i++){
      var nodes2 = new Element("td", {class: 'last_row'}).update(totals[i]);
      nodes.appendChild(nodes2);
    }
    $(data["key"] + "_body").appendChild(nodes);
  }

  $(data["key"] + "_loading").hide();

  if(data["key"]=="users_by_major") stat_get_result("users_stat");
}

function stat_get_cells(key, arr){
  switch(key){
    case "users_by_major": return [arr["major"], arr["count_users"], arr["count_friends"]];
    case "users_stat": return [arr["year"], arr["count_users"], arr["count_friends"]];
    default: return [101, 203, "abc"];
  }
}

function show_grades(){
  var elements = $$('.grades');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
  var elements = $$('.nogrades');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide();
  }
}
function hide_grades(){
  var elements = $$('.grades');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide()
  }
  var elements = $$('.nogrades');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
}
function toggle_grades(){
  var elements = $$('.grades');
  if(elements[0].getStyle('display')=='none') show_grades();
  else hide_grades();
}

function show_gpas(){
  var elements = $$('.gpas');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
  var elements = $$('.nogpas');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide();
  }
}
function hide_gpas(){
  var elements = $$('.gpas');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide();
  }
  var elements = $$('nogpas');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
}
function toggle_gpas(){
  var elements = $$('.gpas');
  if(elements[0].getStyle('display')=='none') show_gpas();
  else hide_gpas();
}
function hide_planner_result(){
  var e = $("planner-result");
  if(!e) return ;
  e.update("");
  e.hide();
}
function toggle_planner_summary(){
  $('planner-summary-content').toggle();
  return ;
  $('planner-summary').show();
  $('planner-summary-loading').show();
  $('planner-summary-content').update("");
  new Ajax.Request(cuts_host + "ajax_planner_summary.php", {
      method: "post",
      parameters: {user_access_token: user_access_token, fb_sig_user: fb_sig_user},
      onSuccess: function(transport){
                   $('planner-summary-loading').hide();
                   $('planner-summary-content').update(transport.responseText);
                 }
  });
}
function is_planner_mode(){
  return $('planner-mode-btn').checked;
}
function planner_mode(){
  var elements = $$('.planner-elements');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
  var elements = $$('.non-planner-elements');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide();
  }
}
function course_profile_mode(){
  var elements = $$('.planner-elements');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.hide();
  }
  var elements = $$('.non-planner-elements');
  for(var i=0; i<elements.length; i++){
    var e = elements[i];
    e.show();
  }
  hide_grades();
}
function add_to_course_profile(coursegroup){
  new Ajax.Request('ajax_courseprofile_add.php', {
    method: 'post',
    parameters: {coursegroup: coursegroup, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      if(data.html){
        $('dummy_row').insert({before: data.html}); //to be changed!
        $$('#coursegroup-'+data.coursegroup+' td')[0].update("Added");
        if(is_planner_mode()) planner_mode();
      }
    }
  });
}
function remove_from_course_profile(ucpid, coursegroup){
  new Ajax.Request('ajax_courseprofile_remove.php', {
    method: 'post',
    parameters: {ucpid: ucpid, coursegroup: coursegroup, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      if(parseInt(data.ok)==1){
        $(data.coursegroup).remove();
      }
    }
  });
}
function planner_easy_mode(){
  $("menu-courseprofile").removeClassName("selected-tab");
  $("menu-plannereasy").addClassName("selected-tab");
  $("menu-planneradvanced").removeClassName("selected-tab");
  $("planner-default").hide();
  $("planner-easy").show();
}

function save_grade(coursegroup){
  var grade_element = $('grade-'+coursegroup);
  var grade = grade_element.value;

  new Ajax.Request('ajax_save_grade.php', {
    method: 'post',
    parameters: {coursegroup: coursegroup, grade: grade, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      var summary_html = data.summary_html;
      var coursegroup = data.coursegroup;
      var grade = $('grade-'+coursegroup);
      var holder = grade.up();

      //update grade value
      var result = data.result;
      grade.value = result;

      //update grade ID for sorting
      var old_id = holder.readAttribute('id');
      var new_id = old_id.substr(0, old_id.indexOf("_")+1) + result;
      holder.writeAttribute('id', new_id);

      //remove loading image
      var loading_image_elements = $$('tr#'+coursegroup+' img');//holder.select("img");
      var loading_image_element = loading_image_elements[0];
      loading_image_element.remove();

      //update GPA values
      $('planner-summary').update(summary_html);
    }
  });

  var holder = grade_element.up();
  var loading = new Element('img', {'src': 'images/loading.gif', 'class': 'grade-loading'});
  holder.appendChild(loading);
}
function toggle_is_in_major_gpa(coursegroup){
  var key = "major_"+coursegroup;

  new Ajax.Request('ajax_toggle_is_in_major_gpa.php', {
    method: 'post',
    parameters: {coursegroup: coursegroup, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      var summary_html = data.summary_html;
      var coursegroup = data.coursegroup;
      var image = data.image;
      if(image==1) imageurl = "tick.png";
      else if(image==0) imageurl = "cross.png";
      else imageurl = "error.gif";
      var e = $("is_in_major_gpa-"+coursegroup);
      if(!e) return ;
      e.writeAttribute('src', "images/" + imageurl);
      $("planner-summary").update(summary_html);
    }
  });

  var e = $("is_in_major_gpa-"+coursegroup);
  if(!e) return ;
  e.writeAttribute('src', "images/" + "loading.gif");
}

/* planner *********************************************************************/
function change_planner_coursecode(newcode, oricode){
  var c = replacements[newcode];
  replacements_current[oricode] = newcode;
  for(var i=0; i<c.length; i++){
    var day = c[i]['day'];
    var start = c[i]['start'];
    var end = c[i]['end'];
    var type = c[i]['type'];
    var venue = c[i]['venue'];
    for(var period=start; period<=end; period++){
      if(period<=0 || period>10) continue;
      var n=-1;
      while(n<200){
        n++;
        var e = $('planner-results-' + n);
        if(!e) break;
        var e1 = $(oricode + '-' + n + '-' + day + '-' + period + '-info1');
        if(!e1) continue;
        e1.update(newcode + ' (' + type + ')');
        var e2 = $(oricode + '-' + n + '-' + day + '-' + period + '-info2');
        e2.update(venue);
      }
    }
  }
}

function planner_set_tt(coursecode_list){
  var coursecodes = coursecode_list.split(',');
  for(var i=0; i<coursecodes.length; i++){
    if(replacements_current[coursecodes[i]]!=null){
      coursecodes[i] = replacements_current[coursecodes[i]];
    }
  }
  coursecode_list = coursecodes.join(',');
  new Ajax.Request('ajax_save_timetable_coursecodes.php', {
    method: 'post',
    parameters: {coursecodes: coursecode_list, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText;
      if(data=="1"){
        redirect(fb_host);
      }else{
        alert("Unknown error occurred. Please try again later or report this in CUTS application page");
      }
    },
    onFailure: function(){
      alert("Unknown error occurred. Please try again later or report this in CUTS application page");
    }
  });
  
//  $('courses_list_id').value = coursecode_list;
//  $('timetable_submit_form').submit();
}

function planner_change_coursegroup_status(coursegroup, new_status){
  var status = ['r', 'e1', 'e2', 'n'];
  for(var i=0; i<status.length; i++){
    var e = $(status[i] + "-" + coursegroup);
    if(!e) return ;
    if(status[i] == new_status){
      e.removeClassName('inactive');
      e.addClassName('active');
    }else{
      e.removeClassName('active');
      e.addClassName('inactive');
    }
  }
}

function planner_run(){
  var inputs = planner_get_inputs();
  $("planner-result").show();
  //check nums
  if(inputs['optional'][0]['num']<0||inputs['optional'][0]['num']>inputs['optional'][0]['coursegroups'].length
 ||inputs['optional'][0]['num']<0||inputs['optional'][0]['num']>inputs['optional'][0]['coursegroups'].length){
    $("planner-result").update("Invalid number for courses to be taken");
    return ;
  }
  //disable button
//  $("planner-run-btn").disabled = true;
  //set loading
  $("planner-result").update("Loading...");
  //make request
  new Ajax.Request('ajax_planner_advanced.php', {
    method: 'post',
    parameters: {inputs: Object.toJSON(inputs), user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onSuccess: function(transport){
      var data = transport.responseText.evalJSON();
      $("planner-run-btn").disabled = false;
      $('planner-result').update(data.fbml_output);
      replacements = data.replacements;
      $$('.small-timetable').each(function(v){ v.observe('click', scroll_to_timetable);});
    },
    onFailure: function(){
      $("planner-run-btn").disabled = false;
    }
  });
}

function set_highlight(evt){ /* ISSUE: is it currently using...?  below functions as well */
  var e = evt.target;
  if(evt.type=="mouseover") highlight_small_timetable(e);
  else if(evt.type=="mouseout"&&e.getTagName()=="DIV") unhighlight_small_timetable(e);
}
function highlight_small_timetable(e){
//  var existing = getElementsByClass('bg-yellow');
//  for(var i=0; i<existing.length; i++) existing[i].removeClassName('bg-yellow');
  var tagname = e.getTagName();
  if(tagname!='DIV'){
     /*if(tagname=='P'||tagname=='TABLE') */highlight_small_timetable(e.getParentNode());
    return ;
  }
  e.addClassName('bg-yellow');
}
function unhighlight_small_timetable(e){
  var tagname = e.getTagName();
  if(tagname!='DIV'){
     if(tagname=='P'||tagname=='TABLE') highlight_small_timetable(e.getParentNode());
    return ;
  }
//  e.setStyle('backgroundColor', 'white');
  e.removeClassName('bg-yellow');
}

function scroll_to_timetable(evt){
  var e = Event.findElement(evt, 'DIV');
  var timetable_id = e.readAttribute("id").substr(2);
  var target_e = $('tt-' + timetable_id);
  //target_e.scrollTo();
  target_e.up().scrollTop = target_e.cumulativeOffset()[1]-target_e.up().cumulativeOffset()[1];
}

function planner_get_inputs(){
  var required = {};
  required['coursegroups'] = [];
  required['sections'] = [];
  var optional1 = {};
  optional1['coursegroups'] = [];
  optional1['sections'] = [];
  optional1['num'] = parseInt($("optional1_num").value);
  var optional2 = {};
  optional2['coursegroups'] = [];
  optional2['sections'] = [];
  optional2['num'] = parseInt($("optional2_num").value);

  $$('.planner-btn').each(function(e){
    if(!e.hasClassName('active') || e.hasClassName('planner-n')) return ;
    var input = e.readAttribute("id");
    if(input[0]=="r"){
      required.coursegroups.push(input.substr(2));
      required.sections.push(planner_get_sections(input.substr(2)));
    }else if(input[1]=="1"){
      optional1.coursegroups.push(input.substr(3));
      optional1.sections.push(planner_get_sections(input.substr(3)));
    }else if(input[1]=="2"){
      optional2.coursegroups.push(input.substr(3));
      optional2.sections.push(planner_get_sections(input.substr(3)));
    }
  });
  var ignore_types = [];
  var ignore_types_holder = $("ignore_types_holder");
  $$('#ignore_types_holder input:checked').each(function(e){ ignore_types.push(e.value); });
  var ret = {"year": year, "term": term, "required": required, "optional": [optional1, optional2], "ignore_types": ignore_types};
  return ret;
}
function planner_show_more(e, coursecode, professor, periods){

  $("planner-section-details").setStyle({top: (e.cumulativeOffset().top + 20) + "px",left: (e.cumulativeOffset().left - 190) + "px"}).show();

  $("section-coursecode").update(coursecode);
  $("section-professor").update(professor.replace(/\|/g, "\n"));
  $("section-periods").update(periods.replace(/#/g, "\n"));

  return ;
}
function planner_remove_more(coursecode){
  var element = $("planner-section-details");
  if(!element) return ;
  element.hide();
  return ;
/* ISSUE: returned
  var element = document.getElementById('more-' + coursecode);
  if(!element) return ;
  element.getParentNode().removeChild(element);
*/
}
function planner_get_sections(coursegroup){
  var sections = [];
  $$('#sections-' + coursegroup + ' div').each(function(e){
    if(e.hasClassName("section-selected")) sections.push(e.readAttribute("id").substr(coursegroup.length + 1));
  });
  return sections;
}

function planner_toggle_section(id){
  var e = $(id);
  if(!e) return ;
  e.toggleClassName('section-selected');
  e.toggleClassName('section-unselected');
}

/********************* settings ***************/
function update_settings(){
  var inputs = {
    sid: $('id_sid').value,
    maid: $('id_maid').value,
    color: $('id_color').value
  };
  new Ajax.Request(cuts_host + "ajax_save_settings.php", {
        method: "post",
        parameters: {sid: inputs.sid,
                     maid: inputs.maid,
                     color: inputs.color,
                     user_access_token: user_access_token,
                     fb_sig_user: fb_sig_user
                    },
        onSuccess: function(transport){
                     var setting_data = transport.responseText.evalJSON();
//                     console.log(setting_data);
                     if(!setting_data.succeeded){
                       show_error_dialog("Error", setting_data.msg);
                     }else{
                       show_message("Updated!", "Settings updated");
                     }
                   }
     });
}

/********************************* coursedb ***************************************/
function coursedb_show_all_coursemates(coursegroup){
  new Ajax.Updater('coursedb-coursemates', 'ajax_coursedb_coursemates.php', {
    method: 'post',
    parameters: {coursegroup: coursegroup, user_access_token: user_access_token, fb_sig_user: fb_sig_user},
    onFailure: show_error_dialog
  });
  $("coursedb-show-all-coursemates-a").update("Loading.. click to reload");
}

function debug(str){
  $('debug').update(str);
}
function redirect(url){
  window.top.location.href = url; 
}
