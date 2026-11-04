// Generated automatically from clients/*/config.json by scripts/sync-configs.js
// Do not edit manually; update clients/<slug>/config.json and run 'npm run sync' or 'node scripts/sync-configs.js'

/*
 * Theme status note for all prototypes:
 * Fallback palettes based on homepage text and vibe.
 * Before presenting to a client as 'matched to your site',
 * perform a visual/CSS check of the live site and replace theme hex colors.
 */

export const CLIENT_CONFIGS = {
  "de-kleinste-kapsalon": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "De Kleinste Kapsalon",
    "slug": "de-kleinste-kapsalon",
    "type": "Hair salon",
    "city": "Rotterdam",
    "website": "http://www.dekleinstekapsalon.nl/",
    "priority": "Warm",
    "problem": "Phone-only booking: site says call and ask for 'Osman'. No online calendar, CRM, reminder or loyalty flow was visible. Homepage also warns online bookings not confirmed by mail/phone are not taken, and the salon may be closed for ambulant work - call before visiting.",
    "contact": {
      "phone": "06-23937985",
      "address": "Lelienstein 102, 3085 DS Rotterdam",
      "email": "contact@dekleinstekapsalon.nl"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#8C4A2F",
      "accent": "#E0A458",
      "background": "#FFF8F0",
      "surface": "#FFFFFF",
      "text": "#2B2118",
      "vibe": "Small, personal, warm, humorous, neighbourhood: 'letterlijk klein maar fijn!'"
    },
    "hours": {
      "Mon": "Closed",
      "Tue": "13:00-17:00",
      "Wed": "13:00-17:00 (+ extra by appointment 17:00-20:00)",
      "Thu": "By appointment",
      "Fri": "09:00-17:00 (+ extra 17:00-20:00)",
      "Sat": "09:00-15:00",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Cut",
        "duration_min": 45,
        "price_sample_eur": 28
      },
      {
        "name": "Cut and colour",
        "duration_min": 120,
        "price_sample_eur": 65
      },
      {
        "name": "Styling",
        "duration_min": 30,
        "price_sample_eur": 20
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Eigenaar & Meesterkapper",
                "name_sample": "Osman"
        },
        {
                "id": "staff-2",
                "role": "Allround Stylist",
                "name_sample": "Mehmet"
        },
        {
                "id": "staff-3",
                "role": "Barbier & Fade Specialist",
                "name_sample": "Can"
        },
        {
                "id": "staff-4",
                "role": "Junior Stylist",
                "name_sample": "Emre"
        }
],
    "features": [
      "online_calendar",
      "call_confirmation_flow",
      "automatic_reminders",
      "rebooking_nudges",
      "client_history_preferences"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, course/pet notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "feel-smooth": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Feel Smooth",
    "slug": "feel-smooth",
    "type": "Beauty salon - wax and laser",
    "city": "Utrecht",
    "website": "http://www.salonfeelsmooth.nl/",
    "priority": "Warm",
    "problem": "A 'Maak een afspraak' route exists, but whether it is a full calendar, a form, or a phone/WhatsApp step was not verified. No verified treatment-course tracking, loyalty/package management, or automated rebooking reminders. Almere second location is unverified - do not claim 2 locations.",
    "contact": {
      "phone": "06 4826 7059",
      "address": "Willem Frederik Hermansstraat 412, 3544 KP Utrecht",
      "email": "info@salonfeelsmooth.nl"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#5A7D7A",
      "accent": "#E8A798",
      "background": "#FDF8F5",
      "surface": "#FFFFFF",
      "text": "#24302E",
      "vibe": "Modern, friendly, smooth and confident wax/laser specialist; confidence and comfort, personal approach"
    },
    "hours": {
      "Tue": "10:00-18:00",
      "Wed": "10:00-19:00",
      "Thu": "11:00-19:00",
      "Fri": "10:00-18:00",
      "Sat": "10:00-18:00",
      "Sun": "10:30-18:00",
      "Mon": "Not listed - do not assume closed"
    },
    "services": [
      {
        "name": "Waxing session",
        "duration_min": 30,
        "price_sample_eur": 30
      },
      {
        "name": "Laser hair removal session",
        "duration_min": 45,
        "price_sample_eur": 65
      },
      {
        "name": "Facial treatment",
        "duration_min": 60,
        "price_sample_eur": 55
      },
      {
        "name": "Body treatment",
        "duration_min": 60,
        "price_sample_eur": 60
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Lasertherapeut & Salonmanager",
                "name_sample": "Sarah"
        },
        {
                "id": "staff-2",
                "role": "Gecertificeerd Diode Laser Specialist",
                "name_sample": "Melissa"
        },
        {
                "id": "staff-3",
                "role": "Huidtherapeut",
                "name_sample": "Nina"
        },
        {
                "id": "staff-4",
                "role": "Laser Operator",
                "name_sample": "Laura"
        }
],
    "features": [
      "booking_route_enhancement_or_calendar",
      "treatment_course_tracking",
      "package_management_sample",
      "automatic_rebooking_reminders",
      "client_history_view"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, course/pet notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Waxing session",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Waxing session",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "hondentrimsalon-finn": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Hondentrimsalon Finn",
    "slug": "hondentrimsalon-finn",
    "type": "Animal grooming - dogs",
    "city": "Den Haag (Ypenburg)",
    "website": "https://hondentrimsalonfinn.nl/",
    "priority": "Hot",
    "problem": "The groomer is also the receptionist while grooming, so bookings wait on WhatsApp/message/email. No calendar or structured intake.",
    "contact": {
      "phone": "Not found in sources checked",
      "address": "Den Haag (Ypenburg)",
      "email": "info@hondentrimsalonfinn.nl"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#1F6F6B",
      "accent": "#E8A798",
      "background": "#FFFFFF",
      "surface": "#F2F7F7",
      "text": "#1F2A2A",
      "vibe": "Calm, small-scale, personal; 'Gemoedelijke sfeer', 'Rustige omgeving'"
    },
    "hours": {
      "Mon-Fri": "09:00-17:30",
      "Sat": "By appointment",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Complete coat care",
        "duration_min": 150,
        "price_sample_eur": 65
      },
      {
        "name": "Puppy habituation session",
        "duration_min": 45,
        "price_sample_eur": 30
      },
      {
        "name": "Wash / dry / trim",
        "duration_min": 90,
        "price_sample_eur": 45
      },
      {
        "name": "Detangling session",
        "duration_min": 60,
        "price_sample_eur": 40
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Allround Trimsalonspecialist",
                "name_sample": "Marloes"
        },
        {
                "id": "staff-2",
                "role": "Rijksgediplomeerd Trimmer & Puppy Coach",
                "name_sample": "Tim"
        },
        {
                "id": "staff-3",
                "role": "Grooming Assistent",
                "name_sample": "Sophie"
        },
        {
                "id": "staff-4",
                "role": "Grote Rassen Specialist",
                "name_sample": "Jesse"
        }
],
    "features": [
      "online_calendar",
      "message_first_intake",
      "pet_profile",
      "puppy_habituation_flow",
      "automatic_reminders",
      "rebooking_nudge"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Complete coat care",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Complete coat care",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "kapsalon-faya": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Kapsalon Faya",
    "slug": "kapsalon-faya",
    "type": "Hair salon",
    "city": "Groningen",
    "website": "https://kapsalonfaya.nl/",
    "priority": "Hot",
    "problem": "Site says 'Loop gerust binnen of bel voor een afspraak' - walk in or call. No online booking widget was visible, price list aside.",
    "contact": {
      "phone": "+31 50 364 6273",
      "address": "Kerklaan 92, 9717 HG Groningen"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#B85C7A",
      "accent": "#2B2B2B",
      "background": "#FFF8FA",
      "surface": "#FFFFFF",
      "text": "#2B2B2B",
      "vibe": "Friendly, personal, informal; first-person welcome, simple cut/colour/style and price blocks"
    },
    "hours": {
      "Mon-Sat": "09:00-18:00",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Cut - adult",
        "duration_min": 45,
        "price_eur": 28,
        "price_from_2027_eur": 30
      },
      {
        "name": "Cut - student / child",
        "duration_min": 45,
        "price_eur": 25,
        "price_from_2027_eur": 27
      },
      {
        "name": "Colour",
        "duration_min": 90,
        "price_from_eur": 40
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Krullen- & Stijlspecialist",
                "name_sample": "Faya"
        },
        {
                "id": "staff-2",
                "role": "Texture & Curly Girl Specialist",
                "name_sample": "Malik"
        },
        {
                "id": "staff-3",
                "role": "Colourist",
                "name_sample": "Aisha"
        },
        {
                "id": "staff-4",
                "role": "Barber & Stylist",
                "name_sample": "Noah"
        }
],
    "features": [
      "online_calendar",
      "per_service_times",
      "automatic_reminders",
      "next_cut_rebooking_nudge"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Cut - adult",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Cut - adult",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "kapsalon-headline": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Kapsalon Headline",
    "slug": "kapsalon-headline",
    "type": "Hair salon",
    "city": "Amsterdam",
    "website": "https://www.headline.salon/",
    "priority": "Warm",
    "problem": "Phone-led in sources checked. No online booking calendar, price list, CRM, reminder or loyalty flow was visible in the homepage text reviewed. Do not claim it has no booking system at all - only that none was visible in sources checked.",
    "contact": {
      "phone": "+31 20 624 3555",
      "address": "Herengracht 148-A, Amsterdam"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#1A1A1A",
      "accent": "#C9A227",
      "background": "#FFFFFF",
      "surface": "#F5F1EB",
      "text": "#1A1A1A",
      "vibe": "Classic, technical, artistic and established: strong technical base, 40+ years, personal approach, long-serving stable crew"
    },
    "hours": {
      "Tue-Fri": "09:00-18:00",
      "Sat": "09:00-16:00",
      "Mon": "Closed",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Technical cut",
        "duration_min": 60,
        "price_sample_eur": 45
      },
      {
        "name": "Cut and colour",
        "duration_min": 120,
        "price_sample_eur": 85
      },
      {
        "name": "Styling",
        "duration_min": 45,
        "price_sample_eur": 30
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Senior Stylist & Salonbeheerder",
                "name_sample": "Mark"
        },
        {
                "id": "staff-2",
                "role": "L'Oréal Colour Expert",
                "name_sample": "Sophie"
        },
        {
                "id": "staff-3",
                "role": "Allround Kapper",
                "name_sample": "Thomas"
        },
        {
                "id": "staff-4",
                "role": "Styliste & Visagiste",
                "name_sample": "Lisa"
        }
],
    "features": [
      "online_calendar",
      "automatic_reminders",
      "rebooking_nudges",
      "client_history_preferences",
      "cut_colour_history"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, course/pet notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Technical cut",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Technical cut",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "kapsalon-issa": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Kapsalon ISSA",
    "slug": "kapsalon-issa",
    "type": "Hair salon",
    "city": "Oisterwijk",
    "website": "https://www.kapsalonissa.nl/",
    "priority": "Hot",
    "problem": "Site FAQ says customers can book online or call, but no clear booking calendar was visible in the review. Booking therefore depends on walk-ins and phone calls during cutting time.",
    "contact": {
      "phone": "+31 6 8641 9477",
      "address": "Spoorlaan 128, 5061 HD Oisterwijk"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#1F1F23",
      "accent": "#C9A227",
      "background": "#FFFFFF",
      "surface": "#F5F1EB",
      "text": "#1F1F23",
      "vibe": "Bold uppercase, elegant/premium barbershop: 'ELEGANCE IS YOUR CHOICE'"
    },
    "hours": {
      "Mon-Fri": "09:00-18:00",
      "Sat": "09:00-17:00",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Cut",
        "duration_min": 45,
        "price_sample_eur": 30
      },
      {
        "name": "Beard / shaving",
        "duration_min": 30,
        "price_sample_eur": 20
      },
      {
        "name": "Hair colour",
        "duration_min": 90,
        "price_sample_eur": 45
      },
      {
        "name": "Facial skincare",
        "duration_min": 45,
        "price_sample_eur": 35
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Zaakvoerder & Hoofdkapper",
                "name_sample": "Issa"
        },
        {
                "id": "staff-2",
                "role": "Kleur- & Krullenspecialist",
                "name_sample": "Samira"
        },
        {
                "id": "staff-3",
                "role": "Senior Stylist",
                "name_sample": "Daan"
        },
        {
                "id": "staff-4",
                "role": "Junior Stylist",
                "name_sample": "Lotte"
        }
],
    "features": [
      "online_calendar",
      "per_service_times",
      "automatic_reminders",
      "next_cut_rebooking_nudge",
      "walk_in_queue_view"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "kapsalon-van-haaren": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Kapsalon van Haaren",
    "slug": "kapsalon-van-haaren",
    "type": "Hair salon",
    "city": "Nijmegen",
    "website": "https://www.kapsalonvanhaaren.nl/",
    "priority": "Warm",
    "problem": "Appointment-only, but the appointment still has to arrive by phone or WhatsApp message. No online calendar was visible.",
    "contact": {
      "phone": "024-3224381",
      "address": "Bloemerstraat 64, 6511 EL Nijmegen",
      "whatsapp": "06-29812429"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#1A1A1A",
      "accent": "#7A2E3A",
      "background": "#FFFFFF",
      "surface": "#F5F2F2",
      "text": "#1A1A1A",
      "vibe": "Simple, traditional, price-list-led; 'Al meer dan 100 jaar'"
    },
    "hours": {
      "Mon-Sat": "09:00-18:00",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Cut",
        "duration_min": 45,
        "price_from_eur": 27
      },
      {
        "name": "Cut - student",
        "duration_min": 45,
        "price_eur": 25
      },
      {
        "name": "Colour / highlights",
        "duration_min": 90,
        "price_eur_min": 37.5,
        "price_eur_max": 85
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Directeur & Meesterkapper",
                "name_sample": "Dhr. Van Haaren"
        },
        {
                "id": "staff-2",
                "role": "Barbier & Heren Stylist",
                "name_sample": "Bram"
        },
        {
                "id": "staff-3",
                "role": "Kleurspecialist",
                "name_sample": "Lucas"
        },
        {
                "id": "staff-4",
                "role": "Dameskapper",
                "name_sample": "Emma"
        }
],
    "features": [
      "online_calendar",
      "student_pricing",
      "phone_whatsapp_as_second_route",
      "automatic_reminders",
      "rebooking_nudges"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Cut",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "polat-beauty": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Polat Beauty",
    "slug": "polat-beauty",
    "type": "Beauty salon",
    "city": "Eindhoven",
    "website": "http://www.polatbeauty.nl/",
    "priority": "Warm",
    "problem": "Directory-led presence in sources checked; no verified online booking, CRM, loyalty or treatment-history flow. Homepage now shows a consult/appointment route via phone, mail or WhatsApp, but the exact calendar form is still unverified. Repeat laser/wax/skin treatments need course tracking and rebooking reminders.",
    "contact": {
      "phone": "+31 6 15486604",
      "address": "Limburglaan 1, 5616 HR Eindhoven"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#8E6B7A",
      "accent": "#D8B4A0",
      "background": "#FFF9F7",
      "surface": "#FFFFFF",
      "text": "#2B2B2B",
      "vibe": "Modern skin clinic, clean and personal, technology-led but warm; certified specialists, personal treatment plan"
    },
    "hours": {
      "Mon-Sat": "09:00-18:00 (directory hours, confirm before building)",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Skin improvement treatment",
        "duration_min": 60,
        "price_sample_eur": 55
      },
      {
        "name": "Laser hair removal session",
        "duration_min": 45,
        "price_sample_eur": 65
      },
      {
        "name": "Waxing",
        "duration_min": 30,
        "price_sample_eur": 25
      },
      {
        "name": "Body contouring session",
        "duration_min": 60,
        "price_sample_eur": 70
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Schoonheidsspecialiste & Eigenaar",
                "name_sample": "Derya Polat"
        },
        {
                "id": "staff-2",
                "role": "Allround Schoonheidsspecialiste",
                "name_sample": "Leyla"
        },
        {
                "id": "staff-3",
                "role": "PMU & Brow Specialist",
                "name_sample": "Aylin"
        },
        {
                "id": "staff-4",
                "role": "Huidexpert",
                "name_sample": "Deniz"
        }
],
    "features": [
      "online_calendar_or_enhanced_booking_route",
      "treatment_course_tracking",
      "package_management_sample",
      "automatic_rebooking_reminders",
      "google_business_profile_ready"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, course/pet notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Skin improvement treatment",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Skin improvement treatment",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "salonyourbeauty": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Schoonheidssalon Yourbeauty",
    "slug": "salonyourbeauty",
    "type": "Beauty salon",
    "city": "Princenhage, Breda",
    "website": "http://salonyourbeauty.nl/",
    "priority": "Warm",
    "problem": "Email/phone only, no online booking widget. Repeat, course-based skin treatments with a skin analysis each time, but no way to book, track a treatment course, or remind a client when the next session is due.",
    "contact": {
      "phone": "+31 6 24 39 33 68",
      "address": "Nieuwe Heilaarstraat 39, Princenhage, Breda",
      "email": "info@salonyourbeauty.nl"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#D9A7B0",
      "accent": "#8FA98F",
      "background": "#FFF9F7",
      "surface": "#FFFFFF",
      "text": "#2B2B2B",
      "vibe": "Calm, wellness, elegant; skin-analysis emphasis, treatment photos"
    },
    "hours": {
      "Mon-Fri": "09:00-18:00",
      "Sat": "By appointment",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Kalahari facial",
        "duration_min": 60,
        "price_eur_min": 51.5,
        "price_eur_max": 75
      },
      {
        "name": "Waxing",
        "duration_min": 30,
        "price_sample_eur": 25
      },
      {
        "name": "Brow / lash styling",
        "duration_min": 30,
        "price_sample_eur": 20
      },
      {
        "name": "Massage",
        "duration_min": 45,
        "price_sample_eur": 40
      },
      {
        "name": "Make-up",
        "duration_min": 45,
        "price_sample_eur": 45
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Klinisch Huidspecialist & Eigenaar",
                "name_sample": "Tamara"
        },
        {
                "id": "staff-2",
                "role": "Dermatologisch Schoonheidsspecialiste",
                "name_sample": "Kim"
        },
        {
                "id": "staff-3",
                "role": "Anti-Aging Therapeut",
                "name_sample": "Anouk"
        },
        {
                "id": "staff-4",
                "role": "Gezichts- & Peelingspecialist",
                "name_sample": "Mila"
        }
],
    "features": [
      "online_calendar",
      "treatment_course_tracking",
      "skin_analysis_notes_per_visit",
      "automatic_rebooking_reminders",
      "client_history_view"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Kalahari facial",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Kalahari facial",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "trimsalon-het-hofje": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Trimsalon het Hofje",
    "slug": "trimsalon-het-hofje",
    "type": "Animal grooming - dogs and cats",
    "city": "Haarlem",
    "website": "http://www.trimsalonhethofje.nl/",
    "priority": "Hot",
    "problem": "Phone-only booking. Pre-visit information (breed, coat, medical issues, fleas, heat, matting, reachable number) has to arrive by phone, for a treatment that blocks hours of diary time.",
    "contact": {
      "phone": "023-5244445 / 06-22224444",
      "address": "Pijlslaan 110, 2014 TP Haarlem"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#2E4A6B",
      "accent": "#D9B36A",
      "background": "#FFFFFF",
      "surface": "#F2F4F7",
      "text": "#1F2A3A",
      "vibe": "Plain, older, text-led; factual paragraphs, pet/cat photos, salon logo"
    },
    "hours": {
      "Mon-Fri": "09:00-17:00",
      "Sat": "By appointment",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Full groom - dog",
        "duration_min": 180,
        "price_sample_eur": 70
      },
      {
        "name": "Full groom - cat (separate quiet room)",
        "duration_min": 150,
        "price_sample_eur": 65
      },
      {
        "name": "Coat care / maintenance",
        "duration_min": 120,
        "price_sample_eur": 50
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Hoofd Dierverzorging",
                "name_sample": "Chantal"
        },
        {
                "id": "staff-2",
                "role": "VBN Erkend Trimbeheerder",
                "name_sample": "Niels"
        },
        {
                "id": "staff-3",
                "role": "Katten- & Konijnenspecialist",
                "name_sample": "Fleur"
        },
        {
                "id": "staff-4",
                "role": "Ontwol- & Föhnspecialist",
                "name_sample": "Sem"
        }
],
    "features": [
      "online_calendar",
      "structured_pre_visit_intake",
      "breed_coat_medical_flags",
      "cats_separate_room_flag",
      "long_treatment_slots",
      "automatic_reminders",
      "rebooking_nudge"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Full groom - dog",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Full groom - dog",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "trimsalon-limbo": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Trimsalon Limbo",
    "slug": "trimsalon-limbo",
    "type": "Animal grooming - dogs, cats, rabbits",
    "city": "Venlo / Tegelen",
    "website": "https://www.trimsalonlimbo.nl/",
    "priority": "Hot",
    "problem": "Bookings start with a WhatsApp photo, email takes 2 working days, and phone only works when the groomer is not busy. No calendar, intake form or reminders.",
    "contact": {
      "phone": "+31 6 3417 5949",
      "address": "Koningstraat 31, Tegelen"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#2F5D3A",
      "accent": "#E8A33D",
      "background": "#FFFFFF",
      "surface": "#F2F5F0",
      "text": "#1F2A22",
      "vibe": "Clean, modern, confident; photo hero, 'Een hond tegelijk', 'Geen lopende band'"
    },
    "hours": {
      "Mon-Fri": "09:00-17:00",
      "Sat": "By appointment",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Full groom - dog",
        "duration_min": 150,
        "price_sample_eur": 65
      },
      {
        "name": "Wash and dry",
        "duration_min": 60,
        "price_sample_eur": 35
      },
      {
        "name": "Trim / tidy",
        "duration_min": 90,
        "price_sample_eur": 45
      },
      {
        "name": "Cat groom",
        "duration_min": 120,
        "price_sample_eur": 60
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Solo Kattentrimmer & Groomer",
                "name_sample": "Anita"
        },
        {
                "id": "staff-2",
                "role": "Vachtverzorging & Gedragsbegeleiding",
                "name_sample": "Sanne"
        },
        {
                "id": "staff-3",
                "role": "Trimassistent",
                "name_sample": "Bram"
        },
        {
                "id": "staff-4",
                "role": "Katten & Kleine Honden",
                "name_sample": "Lieke"
        }
],
    "features": [
      "online_calendar",
      "photo_upload_intake",
      "breed_coat_behaviour_notes",
      "one_pet_at_a_time_slots",
      "automatic_reminders",
      "rebooking_nudge"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Full groom - dog",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Full groom - dog",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  },
  "violettas-dog-grooming": {
    "schema_version": "1.0",
    "prototype": "static-data-only",
    "client": "Violetta's Dog Grooming",
    "slug": "violettas-dog-grooming",
    "type": "Animal grooming - dogs",
    "city": "Zuidhorn",
    "website": "https://trimsalonzuidhorn.nl/index-en.html",
    "priority": "Hot",
    "problem": "Solo, appointment-only, message-first. All bookings and intake arrive by message/inbox, with no calendar, CRM or reminders. A page on the site said it was under development.",
    "contact": {
      "phone": "Not found in sources checked",
      "address": "Zuidhorn, Groningen"
    },
    "theme": {
      "status": "fallback - to confirm against live site CSS/visual check",
      "primary": "#C96F4A",
      "accent": "#7A8B6F",
      "background": "#FFF9F2",
      "surface": "#FFFFFF",
      "text": "#2B2B2B",
      "vibe": "Simple, personal, friendly; price list and long personal story, shelter project"
    },
    "hours": {
      "Mon-Fri": "09:00-17:00",
      "Sat": "By appointment",
      "Sun": "Closed"
    },
    "services": [
      {
        "name": "Full groom - small dog",
        "duration_min": 120,
        "price_sample_eur": 55
      },
      {
        "name": "Full groom - medium dog",
        "duration_min": 150,
        "price_sample_eur": 85
      },
      {
        "name": "Full groom - large dog",
        "duration_min": 180,
        "price_sample_eur": 115
      },
      {
        "name": "Wash only",
        "duration_min": 60,
        "price_sample_eur": 35
      },
      {
        "name": "Nails",
        "duration_min": 20,
        "price_sample_eur": 15
      },
      {
        "name": "Ears",
        "duration_min": 15,
        "price_sample_eur": 10
      }
    ],
    "staff_sample": [
        {
                "id": "staff-1",
                "role": "Gediplomeerd Hondentrimmer & Eigenaar",
                "name_sample": "Violetta"
        },
        {
                "id": "staff-2",
                "role": "Allround Groomer",
                "name_sample": "Lars"
        },
        {
                "id": "staff-3",
                "role": "Vacht- & Huidverzorging",
                "name_sample": "Maria"
        },
        {
                "id": "staff-4",
                "role": "Bad & Föhn Specialist",
                "name_sample": "Elena"
        }
],
    "features": [
      "online_calendar",
      "message_first_intake",
      "pet_profile_breed_coat_notes",
      "cancellation_policy_24h",
      "automatic_reminders",
      "rebooking_nudge"
    ],
    "booking_flow": [
      "Choose service",
      "Choose staff (or 'first available')",
      "Choose date and time from available slots only",
      "Enter client details and, where relevant, pet / skin / pre-visit notes",
      "Review summary",
      "Confirm - see confirm dialog",
      "Toast: booking confirmed",
      "Reminder (prototype: simulated)"
    ],
    "static_data_note": "All prices, staff names and appointments in this prototype are SAMPLE data, except prices explicitly listed as public prices in the lead reports. Replace with the client's real data before any live use. No real client records are included.",
    "sample_appointments": [
      {
        "id": "apt-sample-1",
        "client_sample": "Sophie van Dijk",
        "service": "Full groom - small dog",
        "date": "2026-11-03",
        "time": "10:00",
        "status": "confirmed"
      },
      {
        "id": "apt-sample-2",
        "client_sample": "Jan de Vries",
        "service": "Full groom - small dog",
        "date": "2026-11-03",
        "time": "11:30",
        "status": "confirmed"
      }
    ],
    "toast_spec": {
      "success": "Booking confirmed",
      "error": "Something went wrong - nothing was booked",
      "info": "Reminder sent (prototype)",
      "position": "bottom-right",
      "auto_dismiss_ms": 4000,
      "must_not_block_action": true
    },
    "confirm_dialog_spec": {
      "cancel_booking": "Show dialog: 'Cancel this booking?' with Cancel / Confirm cancel. Only cancel on Confirm.",
      "delete_client_or_pet": "Show dialog with what will be deleted. Only delete on Confirm.",
      "reschedule": "Show summary of old and new slot, Confirm to move."
    }
  }
};

export const CLIENT_SLUGS = [
  "de-kleinste-kapsalon",
  "feel-smooth",
  "hondentrimsalon-finn",
  "kapsalon-faya",
  "kapsalon-headline",
  "kapsalon-issa",
  "kapsalon-van-haaren",
  "polat-beauty",
  "salonyourbeauty",
  "trimsalon-het-hofje",
  "trimsalon-limbo",
  "violettas-dog-grooming"
];

export function getClientConfig(slug) {
  return CLIENT_CONFIGS[slug] || CLIENT_CONFIGS['kapsalon-issa'];
}
