# Tesla Smart Charger

Charge your Tesla with lowest utility prices!

When the Tesla is plugged in the charger and home, this app can handle the charging.

## Install:

To install:

* Add the Tesla device
* Add a flow to adjust the 'Charge start', 'Charge end' and 'Max. charge hours in period', or update directly in 'Advanced settings'.
* For Nordic and Baltic countries: go to 'Advanced settings' and set the 'Utility price settings': 'Price area', and 'Currency'.


## Device: Tesla

#### Triggers

- Charging started (token: battery (%))
- Charging stopped (tokens: battery (%), meter_power (kWh), complete (boolean))
- The vehicle state changed (token: vehicle_state)
- Charge plan created (token: charge_plan)
- Vehicle left home (token: distance_from_home)
- Vehicle came home (token: distance_from_home)
- Vehicle left location (tokens: name, latitude, longitude)
- Vehicle entered location (tokens: name, latitude, longitude)
- Vehicle started moving (tokens: latitude, longitude)
- Vehicle stopped moving (tokens: latitude, longitude)
- Software update is available (token: version)

#### Conditions

- Is plugged in
- Is charge port open
- Is charging
- Is locked
- Is Sentry Mode on
- Is aircondition on
- Is home
- Is moving
- Is at location (Location)
- Is software update available

#### Actions

- Set charge mode (Off, Automatic, Manual, Charge now)
- Set period for charging (Start charging, Stop charging, Max. charge hours in period)
- Set 'Data fetch interval' (Data fetch interval)
- Charge port door (Close, Open)
- Charging (Off, On)
- Set charge limit mode (Standard, Max range)
- Set charge limit % (limit)
- Aircondition (Off, On)
- Aircondition temperature (temperature)
- Seat heating
- Steering wheel heating
- Lock / unlock doors (Lock, Unlock)
- Actuate trunk (Front, Rear)
- Set Sentry Mode (Off, On)
- Reset power meter
- Add current location to geofence (Name)
- Add location to geofence (Name, Longitude, Latitude)
- Delete location from geofence (Location)
- Navigate to (Address, Google Maps url)
- Activate speed limit
- Deactivate speed limit
- Clear speed limit pin
- Schedule software update
- Cancel software update
- Honk horn
- Flash light

#### Capabilities

- Charge mode (off, automatic, manual_std, charge_now)
- Charging state (Disconnected, Stopped, Charging, Complete)
- Charging rate (km/h)
- Battery range (km)
- Measure battery (%)    
- Battery ideal range (km)    
- Planned charge (km)    
- Time to full charge (h)    
- Charge limit (%)    
- Measure power (W)
- Meter power (kWh)    
- Measure temperature (inside C)    
- Measure temperature (outside C)    
- Speed (km/h)    
- Odometer (km)    
- Locked (true/false)    
- Vehicle state (online, asleep)
- Location (address)    
- Distance from home (m)
- Longitude (lon)
- Latitude (lat)
- Software version
    
## Modes:

#### Mode: Off

Will not handle any charging, but charging can be controlled by flows.

#### Mode: Charge now

Will start charging instantly.  After the charging is complete, or the charger is unplugged, the mode will switch automatically to 'Off'.

#### Mode: Manual

Will handle charging in the 'charge period', but does not require utility prices.

#### Mode: Automatic

Will handle charging in the 'charge period', and will charge when utility prices are low. To charge when the prices are low, just a few of all the hours in the period must be used for charging.  So to get the lowest prices, it is better to charge the car every night.


## Details about triggers (when):

#### Charging started / stopped

Will trigger when the app sees that charging has started or stopped, and not just charging started or stopped by this app.

#### The vehicle state changed

Trigged when the app sees that the vehicle state (Online, Offline, Asleep) has changed.

#### Charge plan created (automatic mode)

For 'Automatic' mode, the 'Charge plan created' will trigger when a new charge plan is created.  The charge plan is created when the app sees that the vehicle is home, the charger is plugged in, and utility prices for today and tomorrow has been fetched.   

The charge plan is available as a token, with information about 'km to be charged', 'sum charge hours', 'cost reduction in percentage' and 'hours for charging with prices'.  

The cost reduction is calculated as the difference between 'Automatic' and 'Manual' modes in percentage, i.e. how much you save by using the automatic mode compared to manual mode.  NB! Fees and grid costs are not taken into consideration here.  Just the utility price.

<img src="https://balmli.github.io/com.tesla.charger/charge_plan.jpg" width="250" height="252">


## Details about actions (then):

#### Add current location to geofence

The current location of the Tesla will be added to a list of locations.  

The 'Vehicle entered location' and 'Vehicle left location' triggers can be used to trigger when the car enters and leaves the location.  

The 'Is at location' condition can be used to check if a specific location is close to the current location.

A maximum of 20 locations can be added.

#### Navigate to (Address, Google Maps url)

To start navigation, both an address and a Google Maps URL must be provided. 

##### Example:

Address: Rigtersbleek-Zandvoort 10, 7521 BE Enschede, Nederland 

Google Maps URL: https://goo.gl/maps/dKVsJZQrgpVNGTQr6


## Details about Advanced settings:

<img src="https://balmli.github.io/com.tesla.charger/adv_settings.png" width="250" height="541">

#### Charge start and end

The period of the day for charging.

#### Charge hours per period (automatic mode)

To get the lowest prices, it is better to charge often, with a low number of charge hours per day.

##### Example

* Set the charge period to 22:00 in the evening, to 06:30 in the morning, for a maximum of 8.5 hours during the night.
* Charge 5 of the 8.5 hours when the prices are lowest, so set the 'Charge hours per period' to 5.

#### Charge rate (km/h) (automatic mode)

The charge rate is used for calculating the necessary hours for charging, and is updated once each day.

#### Price area (automatic mode)

Price area for utility prices.  Nordic and Baltic countries are supported.

#### Currency (automatic mode)

Currency for utility prices.

#### Data fetch interval (minutes)

Fetching data will wake up the vehicle, and it will stay awake for 10 minutes before going to sleep again.  So a low fetch interval will lead to higher battery loss, i.e. vampire drain.

The default value for the fetch interval is 60 minutes, so the vehicle will be awake 10 minutes and asleep 50 minutes every hour.

When the vehicle is connected to the charger, or there is a charge plan, the state of the vehicle is checked every minute.

The value of the fetch interval will affect the latency of the triggers that respond to the state of the vehicle.

#### Location accuracy

Radius in meters for checking if home or at a location.

#### Minimum refresh interval when streaming

To avoid a too high load on the Homey when streaming, there is a minimum refresh interval.  The default is 10 seconds.

#### Battery range

Select between ideal battery range (default), and estimated battery range.

## Details about Maintenance Actions:

To repair go to device settings -> Maintenance Actions, and click the Repair - button.


## Disclaimer:

Use at your own risk. I accept no responsibility for any damages caused by using this app.


## Release Notes:

#### 1.1.3

- Fix utility prices.

#### 1.1.2

- Fix authentication.

#### 1.1.1

- Added location capability.

#### 1.0.42

- Fix multi-factor authentication.

#### 1.0.41

- Fix multi-factor authentication.

#### 1.0.38

- Support multi-factor authentication.

#### 1.0.37

- Support new authentication system. Go to Device settings - Maintenance Actions - Repair to repair.

#### 1.0.36

- Added capability for 'Software version update'

#### 1.0.35

- Fix for consecutive condition cards, ref. issue #4

#### 1.0.34

- Fix for power calculation

#### 1.0.33

- Switched from data to vehicle_data endpoint
- Switched to OAuth for streaming

#### 1.0.32

- Better power calculation for 3-phase chargers
- Select between ideal and estimated battery range in Adv. settings

#### 1.0.31

- Do not poll every minute when plugged in, but not charging
- Added setting for minimum refresh interval for streaming

#### 1.0.30

- Added latitude and longitude as capabilities

#### 1.0.29

- Speed and odometer is not saved to Insights

#### 1.0.28

- Fixed timestamp check for calculating meter power

#### 1.0.27

- Minor fixes

#### 1.0.26

- Streaming API fixes

#### 1.0.25

- Minor bugfix

#### 1.0.24

- Added navigation request

#### 1.0.23

- Improved error handling

#### 1.0.22

- Added speed and odometer to sensors
- Use streaming API for speed, odometer and battery range
- Actions to handle speed limit

#### 1.0.21

- Added action for location to geofence (Name, Longitude, Latitude)

#### 1.0.20

- Support software update

#### 1.0.19

- Fixed images

#### 1.0.18

- Added actions for 'Seat heating' and 'Steering wheel heating'.
- Added README.txt
- Uses Homey compose

#### 1.0.17

- only update 'Charge rate (km/h)' when charging at home
- clear charge plan if 'Charge rate (km/h)' was changed from settings
- added action to turn on / off max. defrost
- added action to open / close windows 

#### 1.0.16

- Fixed getMeterPowerStart - bug when using 'Charge now' 

#### 1.0.15

- Fixed no_password - bug when validating grant

#### 1.0.14

- Fixed no_username - bug when validating grant

#### 1.0.13

- Changes in error handling

#### 1.0.12

- Fixed 'Planned charge' in 'Charge plan' token
- Better fetching of data 
- Charging rate, Battery range and Odometer in Insights

#### 1.0.11

- Will start charging instantly when selecting 'Charge now'

#### 1.0.10

- Initial version
