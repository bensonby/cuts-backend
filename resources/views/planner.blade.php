@extends('layouts.app')

@section('title', 'CUTS planner')

@section('head')
  @vite(['resources/js/app.js'])
@endsection

@section('content')
<script type="text/javascript">
  var year = {{ $year }};
  var term = {{ $term }};
</script>
<div id="app">
</div>
@endsection
