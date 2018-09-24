/*
 * Copyright 2003-2006, 2009, 2017, United States Government, as represented by the Administrator of the
 * National Aeronautics and Space Administration. All rights reserved.
 *
 * The NASAWorldWind/WebWorldWind platform is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Illustrates how to use a GoToAnimator to smoothly move the view to a new location. This example listens for
 * terrain picks and moves the view to the location picked.
 */
 /*
 each city should have details about it */

 /*Front end probs:
  Also, there should be a dropdown of the users history
*/

/*Backend probs:
   Need to use node.js to access database
   How to use the dataset's api capabilities and store into a databse
   Add html into the display showing the data values after being parsed
*/

requirejs(['./WorldWindShim',
        './LayerManager'],
    function (WorldWind,
              LayerManager) {
        "use strict";

        // Tell WorldWind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
        // Create the WorldWindow.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        // Create and add layers to the WorldWindow.
        var layers = [
             // Imagery layers.
             {layer: new WorldWind.BMNGLayer(), enabled: true},
             {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
             {layer: new WorldWind.BingAerialLayer(null), enabled: false},
             {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
             {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
             {layer: new WorldWind.OpenStreetMapImageLayer(null), enabled: false},
             // Add atmosphere layer on top of all base layers.
             {layer: new WorldWind.AtmosphereLayer(), enabled: true},
             // WorldWindow UI layers.
             {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},

         ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }


        // Now set up to handle clicks and taps.
        var canvas = document.createElement("canvas"),
                    ctx2d = canvas.getContext("2d"),
                    size = 64, c = size / 2 - 0.5, innerRadius = 5, outerRadius = 20;

                canvas.width = size;
                canvas.height = size;

                var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
                gradient.addColorStop(0, 'rgb(255, 0, 0)');
                gradient.addColorStop(0.5, 'rgb(0, 255, 0)');
                gradient.addColorStop(1, 'rgb(255, 0, 0)');

                ctx2d.fillStyle = gradient;
                ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
                ctx2d.fill();

                // Set placemark attributes.
                var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
                // Wrap the canvas created above in an ImageSource object to specify it as the placemarkAttributes image source.
                placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
                // Define the pivot point for the placemark at the center of its image source.
                placemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
                placemarkAttributes.imageScale = 1;
                placemarkAttributes.imageColor = WorldWind.Color.WHITE;

                // Set placemark highlight attributes.
                // Note that the normal attributes are specified as the default highlight attributes so that all properties
                // are identical except the image scale. You could instead vary the color, image, or other property
                // to control the highlight representation.
                var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                highlightAttributes.imageScale = 1.2;
                // Create the placemark with the attributes defined above.

        var position; var lat = 0; var long = 0;

        // The common gesture-handling function.
        var handleClick = function (recognizer) {
            // Obtain the event location.
            var x = recognizer.clientX,
                y = recognizer.clientY;

            // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
            // relative to the upper left corner of the canvas rather than the upper left corner of the page.
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

            // If only one thing is picked and it is the terrain, tell the WorldWindow to go to the picked location.
          //  if (pickList.objects.length === 1 && pickList.objects[0].isTerrain) {
                position = pickList.objects[0].position; lat = position.latitude; long = position.longitude;
                var worldWLoc = new WorldWind.Position(position.latitude, position.longitude,800000);

                //wwd.goTo(worldWLoc);
                var placemarkPosition = new WorldWind.Position(position.latitude, position.longitude, 1e2);
                var placemark = new WorldWind.Placemark(placemarkPosition,false, placemarkAttributes);
                // Draw placemark at altitude defined above, relative to the terrain.
                placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                // Assign highlight attributes for the placemark.
                placemark.highlightAttributes = highlightAttributes;

                // Create the renderable layer for placemarks.
                var placemarkLayer = new WorldWind.RenderableLayer("Custom Placemark");

                // Add the placemarks layer to the WorldWindow's layer list.
               wwd.addLayer(placemarkLayer);
                // Add the placemark to the layer.
               placemarkLayer.addRenderable(placemark);

               wwd.goTo(worldWLoc);
               //As the search button is hovered over, the details of the city should
               //be displayed
                //Need to use Google maps geolocation to turn coordinates into country and then get iso from
                //http://climatedataapi.worldbank.org/climateweb/rest/v1/country

               $(searchButton).hover(function(){

                 var request = new XMLHttpRequest();

                 request.open('GET', 'http://climatedataapi.worldbank.org/climateweb/rest/v1/country/mavg/bccr_bcm2_0/a2/pr/2020/2039/bgd', true);
                 request.onload = function () {

                  // Begin accessing JSON data here
                  var data = JSON.parse(this.response);

                  if (request.status >= 200 && request.status < 400) {
                    data.forEach( country=> {

                      console.log(country.monthVals);
                    });
                  } else {
                    console.log('error');
                  }


                }

                request.send();


               });
          //}

        };


        // Listen for mouse clicks.
        var clickRecognizer = new WorldWind.ClickRecognizer(wwd, handleClick);


        var layerManager = new LayerManager(wwd);



    });
