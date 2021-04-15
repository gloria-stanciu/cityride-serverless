export interface Input {
  feedId: string;
}

export interface Feed {
  id: string;
  publisher_name: string;
  publisher_url: string;
  lang: string;
  version: string;
  start_date: string;
  end_date: string;
}

export interface Agency {
  agency_id: string
  agency_name: string
  agency_url: string
  agency_timezone: string
  agency_lang: string | null
  agency_phone: string | null
  agency_fare_url: string | null
  agency_email: string | null
}

export interface Routes {
  route_id: string
  agency_id: string
  route_short_name: string | null
  route_long_name: string | null
  route_desc: string | null
  route_type
  route_url: string | null
  route_color: string | null
  route_text_color: string | null
}

export interface ShapePoints {
  shape_id: string | null
  feed_id: string
  shape_pt_lat: string
  shape_pt_lon: string
  shape_pt_sequence: string
  shape_dist_traveled: string | null
}

export interface Trips {
  trip_id: string
  route_id: string | null
  service_id: string | null
  headsign: string | null
  short_name: string | null
  direction_id
  block_id: string | null
  shape_id: string | null
  wheelchair_accessible
  bikes_allowed
  is_visible: boolean
}

export interface Calendar {
  feed_id: string
  service_id: string
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
  start_date
  end_date
}

export interface Calendar_Dates {
  feed_id
  service_id
  date_time
  exception_type
}

export interface Stops {
  stop_id: string
  stop_code: string
  stop_name: string
  stop_desc: string
  stop_lat: string
  stop_lon: string
  zone_id
  stop_url: string
  location_type
  parent_station: string
  stop_timezone
  wheelchair_boarding
}

export interface StopTimes {
  trip_id: string
  arrival_time
  departure_time
  stop_id: string
  stop_sequence
  stop_headsign: string
  pickup_type
  dropoff_type
  timepoint
  shape_dist_traveled: string
}

export interface Transfers {
  from_stop_id: string
  to_stop_id: string
  transfer_type
  min_transfer_time
}