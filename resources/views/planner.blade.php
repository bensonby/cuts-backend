@extends('layouts.app')

@section('title', 'CUTS App - CUHK Timetable System')

@section('head')
  <link href="stylesheet_planner2.css" rel="stylesheet" type="text/css" media="screen" />
  <script type="text/javascript" src="js/prototype.js"></script>
  <script type="text/javascript" src="js/scripts.js"></script>
  <script type="text/javascript" src="js/scriptaculous/scriptaculous.js?load=effects,dragdrop"></script>
  <script type="text/javascript" src="js/droplicious.js"></script>
  <script type="text/javascript" src="js/jscolor/jscolor.js"></script>
  <script type="text/javascript" src="js/rgbcolor.js"></script>
  <script type="text/javascript" src="js/planner2.js?v=0.011"></script>
  <script type="text/javascript" src="js/input-default-text.js"></script>
  <script type="text/javascript" src="js/event.simulate.js"></script>
@endsection

@section('content')
<script type="text/javascript">
  var year = {{ $year }}
  var term = {{ $term }}
  var cuts_host = "http://localhost/";
  var timetable = false;
  var load_timetable_flag = true;
</script>

<div id="full-container" style="height: 100vh; width: auto; min-height: 800px;">
  <div style="position: fixed; height: 35px; top: 0; z-index: 3;">
    <ul id="menu" style="height: 35px; top: 0;">
      <span style="font-size: 18px;">
        <a href="/planner?year={{ $year }}&term=1">{{ $year }} Term 1</a> |
        <a href="/planner?year={{ $year }}&term=2">{{ $year }} Term 2</a>
      </span>
    </ul>
  </div>


<div id="whole_planner" style="width: 100%; height: 100%; box-sizing: border-box; padding-top: 35px; padding-bottom: 72px;">
  <div id="right_panel" style="position: fixed; width: 600px; top: 35px; left: 0; height: 800px; min-height: 800px; float: none; overflow: auto;">
    <div id="total_units">Total Units: <span id="current_units">0</span></div>

    <div id="clear-all-button" class="small-button inline" onclick="javascript:clear_all()">Clear all</div>
    <div id="toggle-edit-button" class="small-button inline" onclick="javascript:toggle_edit_timetable()">Preview</div>
    <div id="undo-button" class="small-button inline inactive" onclick="javascript:undo_history.undo()">Undo</div>
    <div id="redo-button" class="small-button inline inactive" onclick="javascript:undo_history.redo()">Redo</div>
    <div class="clear"></div>

    <table id="tsa-container"><tr><td>TBA periods are placed here: </td><td id="period_00" class="cell"></td></tr></table>
    <table id="result_table"><tbody>
      <tr id="header_row">
        <td> </td><th>M</th><th>T</th><th>W</th><th>H</th><th>F</th><th>S</th>
      </tr>
      @for ($i = 1; $i <= 15; $i++)
        <tr>
          <td class="lesson-number">{{ $i }}</td>
          @for ($j = 1; $j <= 6; $j++)
            <td id="period_{{ $j }}{{ $i }}" class="cell"></td>
          @endfor
        </tr>
      @endfor
    </tbody></table>
  </div> <!-- right_panel -->

  <div id="left_panel" style="box-sizing: border-box; padding-left: 625px; width: auto; height: auto; float: none;">

    <h5 style="border-bottom: 0;">CUTS Planner: {{ $year }} Term {{ $term }}</h3>
    <div id="loading_panel" style="display: none;">Loading...</div>

    <div id="course_search_panel">
      <form id="course_search_form" name="cs_name" onsubmit="course_search(); return false">
        <b>Search by Coursecodes: </b>
        <input id="coursecode_key_id" type="text" name="coursecode_key" size="20" autocomplete="off" style="width: 250px;"/>
        <input type="button" onclick="course_search()" name="foo_a" value="Go" /><br />

      </form>

      <form id="course_period_search_from" name="cps_name" onsubmit="course_period_search(); return false">
      <b>Search by Time: </b>
        Day (MTWHFS): <input id="course_day_id" type="text" name="course_day" size="1" value="M"  style="width: 30px;" />
        Period (1-15): <input id="course_period_id" type="text" name="course_period" size="3" value="1" style="width: 30px;" />
        <input type="button" onclick="course_period_search()" name="foo_b" value="Go" /><br />
      </form>
      <div id="course-data-container" style="height: auto;">
        <table class="clear"><thead><tr>
          <th width="80">Coursecode</th>
          <th width="230">Name</th>
          <th width="160">Professor</th>
          <th width="20" style="font-size: 8px;">Units</th>
        </tr></thead><tbody id="course-data-table"></tbody></table>
      </div>

    </div>
  </div> <!-- left_panel -->

</div> <!-- whole planner -->

<div id="info-panel" style="display: none;">
  <div id="info-coursecode"></div>
  <input class="color" id="color-editor" size="1" style="visibility: hidden;" />
  <div class="button clear" id="set-color">Change Color</div>
  <div class="button" id="set-attend">Attending</div>
  <div class="button" id="set-tba-period">TBA Period:
     <span id="info-day">Z</span><input id="day-input" type="text" size="2" style="display: none;">
     <span id="info-start">0</span><input id="start-input" type="text" size="2" style="display: none;">
            - <span id="info-end">0</span><input id="end-input" type="text" size="2" style="display: none;"><br />
     <span id="tba-period-error" class="error" style="display: none;">Invalid Day/Time<br /></span>
     <input id="tba-period-submit" type="button" value="Done" style="display: none;" />
     <input id="tba-period-cancel" type="button" value="Cancel" style="display: none;" />
  </div>
  <div class="button" id="set-tba-venue">TBA Venue:
     <span id="info-venue">TBA</span><input id="venue-input" type="text" size="5" style="display: none;"><br />
     <input id="tba-venue-submit" type="button" value="Done" style="display: none;" />
     <input id="tba-venue-cancel" type="button" value="Cancel" style="display: none;" />
  </div>
  <div class="button" id="reset-tba">Reset to Z0 @ TBA</div>
  <div class="button" id="set-remove">Remove Course</div>
  <div class="info" id="info-period"></div>
  <div class="info" id="info-course"></div>
</div>

<div id="loading-screen" style="display: none;">
  Loading...
</div>

<script type="text/javascript">
<!--
  init();
//-->
</script>
<div id="debug"> </div>

</div><!-- end of full-container -->


</body></html>
@endsection
