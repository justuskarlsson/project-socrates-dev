import { collection, addDoc } from "firebase/firestore";
import { db } from './stores'


export async function addGermanCourse(){
  let courseRef;
  try {
    courseRef = await addDoc(collection(db, 'courses'), {
      name: 'German 101'
    });
    console.log(`New course created with ID: ${courseRef.id}`);
  } catch (e) {
    console.error('Error adding document: ', e);
  }

  if (courseRef === undefined) {
    console.error('Error adding document: ');
    return;
  }
  
  // Define the lessons
  const lessons = [
    {
      name: 'Introduction to German',
      description: 'Get an overview of the German language, its origins, and its importance in the world today.'
    },
    {
      name: 'German Alphabet and Pronunciation',
      description: 'Learn the German alphabet and the correct pronunciation of German letters and sounds.'
    },
    {
      name: 'Basic German Phrases',
      description: 'Learn basic German phrases that are useful in everyday conversations.'
    },
    {
      name: 'German Numbers and Colors',
      description: 'Learn how to count in German and how to say different colors.'
    },
    {
      name: 'German Grammar Basics',
      description: 'Understand the basic rules of German grammar, including noun genders and verb conjugation.'
    },
    {
      name: 'German Vocabulary Building',
      description: 'Expand your German vocabulary with common words and phrases used in daily life.'
    },
    {
      name: 'Conversational German',
      description: 'Practice common German conversations in various settings.'
    },
    {
      name: 'Understanding German Culture',
      description: 'Learn about German culture, customs, and etiquette.'
    },
    {
      name: 'Advanced Grammar and Vocabulary',
      description: 'Dive deeper into complex grammar rules and expand your vocabulary.'
    },
    {
      name: 'Review and Practice',
      description: 'Review everything you have learned and practice with comprehensive exercises.'
    }
  ];
  
  // Add the lessons to the course
  for (const lesson of lessons) {
    try {
      await addDoc(collection(db, 'courses', courseRef.id, 'lessons'), lesson);
      console.log(`Added lesson: ${lesson.name}`);
    } catch (e) {
      console.error('Error adding lesson: ', e);
    }
  }
}

