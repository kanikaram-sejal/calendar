'use client'; 
import styles from "./page.module.css";
import {format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay} from 'date-fns';
import {useEffect, useState} from "react";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventID, setSelectedEventID] = useState(null);
  const today = new Date();

  useEffect(()=> {
    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfWeek(endOfMonth(currentDate));

    const calendarDays = [];
    let day = startDate;

    while(day <= endDate){
      calendarDays.push(day);
      day = addDays(day, 1);
    }
    setDays(calendarDays);
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => addDays(startOfMonth(prev), -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addDays(endOfMonth(prev), 1));
  };

  const handleToday = () => {
    setCurrentDate(today);
  };

  const openModal = (date, event = null) => {
    setSelectedDate(date || new Date());
    if(event){
      setEditingEvent(event);
      setEventTitle(event.title);
      setEventDescription(event.description);
    } else {
      setEditingEvent(null);
      setEventTitle("");
      setEventDescription("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEventSubmit = () => {
    if(eventTitle.trim !== ""){
      const newEvent = {
        id: Date.now(),
        title: eventTitle, 
        description: eventDescription,
        date: selectedDate,
      }

      if(editingEvent){
        setEvents(events.map(event => event.id === editingEvent.id ? newEvent : event));
      } else {
        setEvents([...events, newEvent]);
      }

      setEventTitle("");
      setEventDescription("");
      setSelectedDate(new Date());
      closeModal();
    }
  };

  const handleEventChange = (e) => {
    const {name, value} = e.target;
    if(name === "title"){
      setEventTitle(value);
    } else if(name === "description"){
      setEventDescription(value);
    }
  };

  const handleDeleteEvent = (eventID) => {
    setEvents(events.filter(event => event.id != eventID));
    setSelectedEventID(null);
  };

  const handleEventClick = (eventId) => {
    setSelectedEventID(prevId => (prevId === eventId ? null : eventId)); 
  };
  
  return (
    <div className={styles.page}>
      <h1>Welcome to my Calendar!</h1>

      <div className={styles.calendar}>
        <div className={styles.header}>
          <button className={styles.todaybutton} onClick={handleToday}>Today</button>
          <div className={styles.center}>
            <h2>{format(currentDate, "MMMM yyyy")}</h2>
          </div>
          <div className={styles.nav}>
            <button onClick={handlePrevMonth}>{"<"}</button>
            <button onClick={handleNextMonth}>{">"}</button>
          </div>
        </div>

        <div className={styles.days}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={idx} className={styles.day}>{day}</div>))}
        </div>

        <div className={styles.grid}>
          {days.map((date, idx) => (
            <div
              key={idx}
              className={`${styles.calendarDay} ${
                date && date.toDateString() === today.toDateString() ? styles.today : ''}`}
              onClick={() => openModal(date)}>
                <div className={styles.date}>{format(date, "d")}</div>
                {events
                  .filter(event => isSameDay(event.date, date))
                  .map(event => (
                    <div
                      key={event.id}
                      className={styles.event}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id); }}>
                      <div>{event.title}</div>
                      {selectedEventID === event.id && (
                        <div className={styles.actions}>
                          <button
                          className={styles.edit}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            openModal(date, event); 
                          }}>Edit</button>
                          <button 
                          className={styles.delete}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}>Delete</button>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      <button className={styles.addevent} onClick={() => openModal(new Date())}>Add Event</button>
        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.content}>
              <h3>{editingEvent ? "Edit Event" : "Add Event"}</h3>
              <div className={styles.inputInfo}>
                <input
                  type="text"
                  name="title"
                  value={eventTitle}
                  onChange={handleEventChange}
                  placeholder="Event Title"
                />
                <textarea
                  name="description"
                  value={eventDescription}
                  onChange={handleEventChange}
                  placeholder="Event Description"
                />
                <label>Event Date:
                  <input
                    type="date"
                    value={format(selectedDate, "yyyy-MM-dd")}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  /> </label>
              </div>
              <button onClick={handleEventSubmit}>
                {editingEvent ? "Save Changes" : "Save Event"}
              </button>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
    </div>
  );
}
