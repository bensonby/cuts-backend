@extends('layouts.app')

@section('title', 'CUTS App - CUHK Timetable System')

@section('head')
  <!-- Custom styles for this template -->
  <link href="/css/landing-page.css" rel="stylesheet">
@endsection

@section('content')
  <!-- Navigation -->
  <nav class="navbar navbar-light bg-light static-top">
    <div class="container">
      <a class="navbar-brand" href="#">
        <img class="align-middle" src="img/logo.png" style="width: 29px; height: 29px; margin-right: 5px;" alt="CUTS logo" />
        <span class="align-middle">CUTS (CUHK Timetable System)</span>
      </a>
      </a>
    </div>
  </nav>

  <!-- Masthead -->
  <header class="masthead text-white text-center">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-xl-9 mx-auto">
          <h1 class="mb-5">The CUHK timetable planner you need</h1>
        </div>
        <div class="col-md-10 col-lg-8 col-xl-7 mx-auto">
          <form>
            <div class="form-row">
              @if ($link_count == 0)
                <div class="col-12 col-md-12">
                    <h4>(Stay tuned!)</h4>
                </div>
              @else
                @if ($ios_link != null)
                  @if ($link_count == 1)
                    <div class="col-12">
                  @else
                    <div class="col-12 col-md-6">
                  @endif
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                      <a href="{{ $ios_link }}" class="align-middle" style="display: inline-block;"><img alt="Get it on App Store" src="img/ios-badge.png" class="align-middle" style="width: 209px; height: 62px;"/></a>
                    </div>
                  </div>
                @endif
                @if ($android_link != null)
                  @if ($link_count == 1)
                    <div class="col-12">
                  @else
                    <div class="col-12 col-md-6">
                  @endif
                    <a href="{{ $android_link }}"><img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" style="width: 240px;"/></a>
                  </div>
                @endif
              @endif
            </div>
          </form>
        </div>
      </div>
    </div>
  </header>

  <!-- Icons Grid -->
  <section class="features-icons bg-light text-center">
    <div class="container">
      <div class="row">
        <div class="col-lg-4">
          <div class="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
            <div class="features-icons-icon d-flex">
              <i class="icon-screen-desktop m-auto text-primary"></i>
            </div>
            <h3>Intuitive Interface</h3>
            <p class="lead mb-0">You will surely love the timetable planning experience with CUTS.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
            <div class="features-icons-icon d-flex">
              <i class="icon-layers m-auto text-primary"></i>
            </div>
            <h3>Course Customization</h3>
            <p class="lead mb-0">Set the colors of your timetable, and toggle the periods as you wish.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="features-icons-item mx-auto mb-0 mb-lg-3">
            <div class="features-icons-icon d-flex">
              <i class="icon-check m-auto text-primary"></i>
            </div>
            <h3>No Annoying Wait</h3>
            <p class="lead mb-0">Free of ads and splash screen. CUTS shows your timetable in 1 second.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer bg-light">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 h-100 text-center text-lg-left my-auto">
          <ul class="list-inline mb-2">
            <li class="list-inline-item">
              <a href="https://www.facebook.com/cuhk.cuts">Contact</a>
            </li>
            <li class="list-inline-item">&sdot;</li>
            <li class="list-inline-item">
              <a href="/tos.html">Terms of Use</a>
            </li>
            <li class="list-inline-item">&sdot;</li>
            <li class="list-inline-item">
              <a href="/privacy-policy.html">Privacy Policy</a>
            </li>
          </ul>
          <p class="text-muted small mb-4 mb-lg-0">&copy; CUTS 2020. All Rights Reserved.</p>
        </div>
        <div class="col-lg-6 h-100 text-center text-lg-right my-auto">
          <ul class="list-inline mb-0">
            <li class="list-inline-item mr-3">
              <a href="https://www.facebook.com/cuhk.cuts" style="color: #4267b2;">
                <i class="fab fa-facebook fa-2x fa-fw"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
  <!-- Bootstrap core JavaScript -->
  <script src="vendor/jquery/jquery.min.js"></script>
  <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
@endsection

