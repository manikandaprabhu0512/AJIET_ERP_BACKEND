const db = require('./src/config/db');

// Raw CSV Data provided from EC_students_multi_semester_dummy_data.xlsx
const rawCsv = `USN,Student Name,Semester,Department,Subject Code,Subjects,Credits,Internal Marks I (50),Internal Marks II (50),Attendance I (%),Attendance II (%),Final Attendance (%),CIE (50),External Marks (50),Total (100),Grade Point,Credit Point,Grade Letter
4JK25EC001,Aarav Sharma,2,Electronics and Communication (EC),EC201,Network Analysis,4,43,47,89,90,90,45,49,94,10,40,O
4JK25EC001,Aarav Sharma,2,Electronics and Communication (EC),EC202,Analog Electronics,4,42,38,92,89,91,40,44,84,9,36,A+
4JK25EC001,Aarav Sharma,2,Electronics and Communication (EC),EC203,Signals and Systems,3,43,43,92,90,91,43,36,79,8,24,A
4JK25EC001,Aarav Sharma,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,42,44,99,99,99,43,44,87,9,27,A+
4JK25EC001,Aarav Sharma,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,42,36,89,97,93,39,38,77,8,24,A
4JK25EC001,Aarav Sharma,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,42,44,97,90,94,43,38,81,9,36,A+
4JK25EC001,Aarav Sharma,3,Electronics and Communication (EC),EC302,Analog Circuits,4,49,43,98,98,98,46,40,86,9,36,A+
4JK25EC001,Aarav Sharma,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,44,40,90,98,94,42,46,88,9,27,A+
4JK25EC001,Aarav Sharma,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,40,44,97,95,96,42,45,87,9,27,A+
4JK25EC001,Aarav Sharma,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,48,48,93,92,93,48,44,92,10,30,O
4JK25EC001,Aarav Sharma,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,42,40,94,98,96,41,46,87,9,36,A+
4JK25EC001,Aarav Sharma,4,Electronics and Communication (EC),EC402,Digital Communication,4,50,50,99,91,95,50,46,96,10,40,O
4JK25EC001,Aarav Sharma,4,Electronics and Communication (EC),EC403,Control Systems,3,46,44,95,92,94,45,38,83,9,27,A+
4JK25EC001,Aarav Sharma,4,Electronics and Communication (EC),EC404,VLSI Design,3,50,44,91,98,95,47,50,97,10,30,O
4JK25EC001,Aarav Sharma,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,47,47,97,99,98,47,49,96,10,30,O
4JK25EC002,Priya Nair,2,Electronics and Communication (EC),EC201,Network Analysis,4,37,37,92,95,94,37,38,75,8,32,A
4JK25EC002,Priya Nair,2,Electronics and Communication (EC),EC202,Analog Electronics,4,30,34,94,95,95,32,38,70,8,32,A
4JK25EC002,Priya Nair,2,Electronics and Communication (EC),EC203,Signals and Systems,3,40,42,90,85,88,41,44,85,9,27,A+
4JK25EC002,Priya Nair,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,41,38,86,92,89,40,43,83,9,27,A+
4JK25EC002,Priya Nair,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,32,34,88,91,90,33,30,63,7,21,B+
4JK25EC002,Priya Nair,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,44,38,93,92,93,41,36,77,8,32,A
4JK25EC002,Priya Nair,3,Electronics and Communication (EC),EC302,Analog Circuits,4,36,40,90,92,91,38,40,78,8,32,A
4JK25EC002,Priya Nair,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,42,39,87,88,88,41,36,77,8,24,A
4JK25EC002,Priya Nair,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,36,36,93,95,94,36,30,66,7,21,B+
4JK25EC002,Priya Nair,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,37,37,88,92,90,37,31,68,7,21,B+
4JK25EC002,Priya Nair,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,42,40,96,97,97,41,46,87,9,36,A+
4JK25EC002,Priya Nair,4,Electronics and Communication (EC),EC402,Digital Communication,4,40,40,94,94,94,40,36,76,8,32,A
4JK25EC002,Priya Nair,4,Electronics and Communication (EC),EC403,Control Systems,3,39,45,94,88,91,42,46,88,9,27,A+
4JK25EC002,Priya Nair,4,Electronics and Communication (EC),EC404,VLSI Design,3,36,38,90,89,90,37,40,77,8,24,A
4JK25EC002,Priya Nair,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,37,38,97,90,94,38,35,73,8,24,A
4JK25EC003,Rohan Patel,2,Electronics and Communication (EC),EC201,Network Analysis,4,30,24,80,86,83,27,24,51,6,24,B
4JK25EC003,Rohan Patel,2,Electronics and Communication (EC),EC202,Analog Electronics,4,31,33,86,82,84,32,32,64,7,28,B+
4JK25EC003,Rohan Patel,2,Electronics and Communication (EC),EC203,Signals and Systems,3,32,32,84,84,84,32,36,68,7,21,B+
4JK25EC003,Rohan Patel,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,34,32,78,82,80,33,30,63,7,21,B+
4JK25EC003,Rohan Patel,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,34,29,77,80,79,32,33,65,7,21,B+
4JK25EC003,Rohan Patel,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,34,31,83,75,79,33,38,71,8,32,A
4JK25EC003,Rohan Patel,3,Electronics and Communication (EC),EC302,Analog Circuits,4,33,30,79,83,81,32,38,70,8,32,A
4JK25EC003,Rohan Patel,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,28,32,78,83,81,30,36,66,7,21,B+
4JK25EC003,Rohan Patel,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,34,32,78,78,78,33,36,69,7,21,B+
4JK25EC003,Rohan Patel,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,30,30,82,80,81,30,33,63,7,21,B+
4JK25EC003,Rohan Patel,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,19,23,77,76,77,21,24,45,5,20,C
4JK25EC003,Rohan Patel,4,Electronics and Communication (EC),EC402,Digital Communication,4,32,30,74,76,75,31,28,59,6,24,B
4JK25EC003,Rohan Patel,4,Electronics and Communication (EC),EC403,Control Systems,3,24,28,78,76,77,26,22,48,5,15,C
4JK25EC003,Rohan Patel,4,Electronics and Communication (EC),EC404,VLSI Design,3,26,34,78,83,81,30,34,64,7,21,B+
4JK25EC003,Rohan Patel,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,21,26,76,80,78,24,30,54,6,18,B
4JK25EC004,Sneha Reddy,2,Electronics and Communication (EC),EC201,Network Analysis,4,26,26,73,74,74,26,20,46,5,20,C
4JK25EC004,Sneha Reddy,2,Electronics and Communication (EC),EC202,Analog Electronics,4,25,26,69,67,68,26,24,50,6,24,B
4JK25EC004,Sneha Reddy,2,Electronics and Communication (EC),EC203,Signals and Systems,3,27,22,76,74,75,25,27,52,6,18,B
4JK25EC004,Sneha Reddy,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,26,32,69,67,68,29,30,59,6,18,B
4JK25EC004,Sneha Reddy,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,19,26,69,73,71,23,27,50,6,18,B
4JK25EC004,Sneha Reddy,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,27,24,73,74,74,26,26,52,6,24,B
4JK25EC004,Sneha Reddy,3,Electronics and Communication (EC),EC302,Analog Circuits,4,32,34,78,76,77,33,31,64,7,28,B+
4JK25EC004,Sneha Reddy,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,23,28,80,79,80,26,28,54,6,18,B
4JK25EC004,Sneha Reddy,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,35,37,78,72,75,36,29,65,7,21,B+
4JK25EC004,Sneha Reddy,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,37,29,72,79,76,33,34,67,7,21,B+
4JK25EC004,Sneha Reddy,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,26,26,80,82,81,26,24,50,6,24,B
4JK25EC004,Sneha Reddy,4,Electronics and Communication (EC),EC402,Digital Communication,4,34,26,83,81,82,30,28,58,6,24,B
4JK25EC004,Sneha Reddy,4,Electronics and Communication (EC),EC403,Control Systems,3,40,39,74,81,78,40,42,82,9,27,A+
4JK25EC004,Sneha Reddy,4,Electronics and Communication (EC),EC404,VLSI Design,3,28,28,73,74,74,28,26,54,6,18,B
4JK25EC004,Sneha Reddy,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,39,40,74,80,77,40,30,70,8,24,A
4JK25EC005,Karthik Iyer,2,Electronics and Communication (EC),EC201,Network Analysis,4,25,25,67,70,69,25,18,43,4,16,P
4JK25EC005,Karthik Iyer,2,Electronics and Communication (EC),EC202,Analog Electronics,4,28,27,66,71,69,28,26,54,6,24,B
4JK25EC005,Karthik Iyer,2,Electronics and Communication (EC),EC203,Signals and Systems,3,24,19,65,69,67,22,21,43,4,12,P
4JK25EC005,Karthik Iyer,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,20,20,64,73,69,20,16,36,0,0,F
4JK25EC005,Karthik Iyer,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,22,16,73,67,70,19,16,35,0,0,F
4JK25EC005,Karthik Iyer,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,14,18,66,64,65,16,12,28,0,0,F
4JK25EC005,Karthik Iyer,3,Electronics and Communication (EC),EC302,Analog Circuits,4,21,19,69,64,67,20,22,42,4,16,P
4JK25EC005,Karthik Iyer,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,16,20,68,67,68,18,20,38,0,0,F
4JK25EC005,Karthik Iyer,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,20,22,63,67,65,21,20,41,4,12,P
4JK25EC005,Karthik Iyer,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,16,19,69,62,66,18,16,34,0,0,F
4JK25EC005,Karthik Iyer,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,24,27,68,72,70,26,26,52,6,24,B
4JK25EC005,Karthik Iyer,4,Electronics and Communication (EC),EC402,Digital Communication,4,15,17,65,68,67,16,13,29,0,0,F
4JK25EC005,Karthik Iyer,4,Electronics and Communication (EC),EC403,Control Systems,3,17,19,66,70,68,18,19,37,0,0,F
4JK25EC005,Karthik Iyer,4,Electronics and Communication (EC),EC404,VLSI Design,3,23,19,72,73,73,21,23,44,4,12,P
4JK25EC005,Karthik Iyer,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,26,22,64,66,65,24,22,46,5,15,C
4JK25EC006,Ananya Gupta,2,Electronics and Communication (EC),EC201,Network Analysis,4,45,48,100,92,96,47,42,89,9,36,A+
4JK25EC006,Ananya Gupta,2,Electronics and Communication (EC),EC202,Analog Electronics,4,42,44,95,92,94,43,40,83,9,36,A+
4JK25EC006,Ananya Gupta,2,Electronics and Communication (EC),EC203,Signals and Systems,3,44,50,97,95,96,47,50,97,10,30,O
4JK25EC006,Ananya Gupta,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,40,48,94,92,93,44,48,92,10,30,O
4JK25EC006,Ananya Gupta,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,44,40,94,95,95,42,40,82,9,27,A+
4JK25EC006,Ananya Gupta,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,49,44,97,98,98,47,43,90,10,40,O
4JK25EC006,Ananya Gupta,3,Electronics and Communication (EC),EC302,Analog Circuits,4,43,44,90,94,92,44,49,93,10,40,O
4JK25EC006,Ananya Gupta,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,37,37,98,98,98,37,46,83,9,27,A+
4JK25EC006,Ananya Gupta,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,48,46,97,91,94,47,40,87,9,27,A+
4JK25EC006,Ananya Gupta,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,50,50,98,94,96,50,47,97,10,30,O
4JK25EC006,Ananya Gupta,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,42,44,99,91,95,43,40,83,9,36,A+
4JK25EC006,Ananya Gupta,4,Electronics and Communication (EC),EC402,Digital Communication,4,47,42,89,90,90,45,42,87,9,36,A+
4JK25EC006,Ananya Gupta,4,Electronics and Communication (EC),EC403,Control Systems,3,46,42,90,99,95,44,38,82,9,27,A+
4JK25EC006,Ananya Gupta,4,Electronics and Communication (EC),EC404,VLSI Design,3,50,46,92,93,93,48,49,97,10,30,O
4JK25EC006,Ananya Gupta,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,44,38,93,96,95,41,36,77,8,24,A
4JK25EC007,Vikram Singh,2,Electronics and Communication (EC),EC201,Network Analysis,4,35,36,91,88,90,36,34,70,8,32,A
4JK25EC007,Vikram Singh,2,Electronics and Communication (EC),EC202,Analog Electronics,4,34,38,88,85,87,36,36,72,8,32,A
4JK25EC007,Vikram Singh,2,Electronics and Communication (EC),EC203,Signals and Systems,3,36,37,90,87,89,37,30,67,7,21,B+
4JK25EC007,Vikram Singh,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,42,42,83,84,84,42,45,87,9,27,A+
4JK25EC007,Vikram Singh,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,36,37,92,83,88,37,39,76,8,24,A
4JK25EC007,Vikram Singh,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,37,41,93,86,90,39,39,78,8,32,A
4JK25EC007,Vikram Singh,3,Electronics and Communication (EC),EC302,Analog Circuits,4,40,34,92,89,91,37,40,77,8,32,A
4JK25EC007,Vikram Singh,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,43,38,92,93,93,41,38,79,8,24,A
4JK25EC007,Vikram Singh,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,33,41,89,91,90,37,41,78,8,24,A
4JK25EC007,Vikram Singh,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,41,41,83,93,88,41,40,81,9,27,A+
4JK25EC007,Vikram Singh,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,38,36,87,95,91,37,34,71,8,32,A
4JK25EC007,Vikram Singh,4,Electronics and Communication (EC),EC402,Digital Communication,4,40,44,93,85,89,42,44,86,9,36,A+
4JK25EC007,Vikram Singh,4,Electronics and Communication (EC),EC403,Control Systems,3,41,36,89,85,87,39,38,77,8,24,A
4JK25EC007,Vikram Singh,4,Electronics and Communication (EC),EC404,VLSI Design,3,41,48,86,95,91,45,46,91,10,30,O
4JK25EC007,Vikram Singh,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,42,48,86,89,88,45,43,88,9,27,A+
4JK25EC008,Meera Joshi,2,Electronics and Communication (EC),EC201,Network Analysis,4,32,32,90,87,89,32,38,70,8,32,A
4JK25EC008,Meera Joshi,2,Electronics and Communication (EC),EC202,Analog Electronics,4,38,34,90,84,87,36,38,74,8,32,A
4JK25EC008,Meera Joshi,2,Electronics and Communication (EC),EC203,Signals and Systems,3,28,26,82,85,84,27,32,59,6,18,B
4JK25EC008,Meera Joshi,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,33,31,87,80,84,32,27,59,6,18,B
4JK25EC008,Meera Joshi,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,36,34,83,90,87,35,42,77,8,24,A
4JK25EC008,Meera Joshi,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,39,43,89,89,89,41,37,78,8,32,A
4JK25EC008,Meera Joshi,3,Electronics and Communication (EC),EC302,Analog Circuits,4,36,42,86,83,85,39,36,75,8,32,A
4JK25EC008,Meera Joshi,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,35,39,83,90,87,37,40,77,8,24,A
4JK25EC008,Meera Joshi,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,38,40,85,83,84,39,36,75,8,24,A
4JK25EC008,Meera Joshi,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,30,36,87,84,86,33,30,63,7,21,B+
4JK25EC008,Meera Joshi,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,38,35,86,84,85,37,43,80,9,36,A+
4JK25EC008,Meera Joshi,4,Electronics and Communication (EC),EC402,Digital Communication,4,40,40,83,81,82,40,32,72,8,32,A
4JK25EC008,Meera Joshi,4,Electronics and Communication (EC),EC403,Control Systems,3,40,40,83,87,85,40,36,76,8,24,A
4JK25EC008,Meera Joshi,4,Electronics and Communication (EC),EC404,VLSI Design,3,38,36,86,81,84,37,30,67,7,21,B+
4JK25EC008,Meera Joshi,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,36,37,84,81,83,37,30,67,7,21,B+
4JK25EC009,Arjun Menon,2,Electronics and Communication (EC),EC201,Network Analysis,4,28,29,77,77,77,29,23,52,6,24,B
4JK25EC009,Arjun Menon,2,Electronics and Communication (EC),EC202,Analog Electronics,4,26,26,75,71,73,26,30,56,6,24,B
4JK25EC009,Arjun Menon,2,Electronics and Communication (EC),EC203,Signals and Systems,3,24,24,75,81,78,24,32,56,6,18,B
4JK25EC009,Arjun Menon,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,24,26,79,76,78,25,26,51,6,18,B
4JK25EC009,Arjun Menon,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,28,28,81,77,79,28,20,48,5,15,C
4JK25EC009,Arjun Menon,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,21,20,74,75,75,21,29,50,6,24,B
4JK25EC009,Arjun Menon,3,Electronics and Communication (EC),EC302,Analog Circuits,4,23,26,76,70,73,25,17,42,4,16,P
4JK25EC009,Arjun Menon,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,26,26,72,72,72,26,22,48,5,15,C
4JK25EC009,Arjun Menon,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,25,27,71,72,72,26,29,55,6,18,B
4JK25EC009,Arjun Menon,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,32,30,70,78,74,31,24,55,6,18,B
4JK25EC009,Arjun Menon,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,18,20,73,74,74,19,24,43,4,16,P
4JK25EC009,Arjun Menon,4,Electronics and Communication (EC),EC402,Digital Communication,4,26,24,73,72,73,25,28,53,6,24,B
4JK25EC009,Arjun Menon,4,Electronics and Communication (EC),EC403,Control Systems,3,25,20,67,68,68,23,18,41,4,12,P
4JK25EC009,Arjun Menon,4,Electronics and Communication (EC),EC404,VLSI Design,3,28,21,69,71,70,25,23,48,5,15,C
4JK25EC009,Arjun Menon,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,22,19,72,72,72,21,28,49,5,15,C
4JK25EC010,Divya Kulkarni,2,Electronics and Communication (EC),EC201,Network Analysis,4,28,24,69,70,70,26,24,50,6,24,B
4JK25EC010,Divya Kulkarni,2,Electronics and Communication (EC),EC202,Analog Electronics,4,22,18,70,67,69,20,22,42,4,16,P
4JK25EC010,Divya Kulkarni,2,Electronics and Communication (EC),EC203,Signals and Systems,3,30,25,69,68,69,28,21,49,5,15,C
4JK25EC010,Divya Kulkarni,2,Electronics and Communication (EC),EC204,Digital Logic Design,3,26,27,69,65,67,27,24,51,6,18,B
4JK25EC010,Divya Kulkarni,2,Electronics and Communication (EC),EC205,Engineering Mathematics II,3,16,22,72,74,73,19,25,44,4,12,P
4JK25EC010,Divya Kulkarni,3,Electronics and Communication (EC),EC301,Electromagnetic Theory,4,24,24,75,74,75,24,28,52,6,24,B
4JK25EC010,Divya Kulkarni,3,Electronics and Communication (EC),EC302,Analog Circuits,4,26,24,69,69,69,25,24,49,5,20,C
4JK25EC010,Divya Kulkarni,3,Electronics and Communication (EC),EC303,Linear Integrated Circuits,3,25,31,75,67,71,28,23,51,6,18,B
4JK25EC010,Divya Kulkarni,3,Electronics and Communication (EC),EC304,Microprocessors and Microcontrollers,3,18,19,67,77,72,19,23,42,4,12,P
4JK25EC010,Divya Kulkarni,3,Electronics and Communication (EC),EC305,Analog Communication Systems,3,22,24,77,73,75,23,26,49,5,15,C
4JK25EC010,Divya Kulkarni,4,Electronics and Communication (EC),EC401,Digital Signal Processing,4,21,21,77,78,78,21,22,43,4,16,P
4JK25EC010,Divya Kulkarni,4,Electronics and Communication (EC),EC402,Digital Communication,4,28,26,78,69,74,27,22,49,5,20,C
4JK25EC010,Divya Kulkarni,4,Electronics and Communication (EC),EC403,Control Systems,3,26,22,73,74,74,24,24,48,5,15,C
4JK25EC010,Divya Kulkarni,4,Electronics and Communication (EC),EC404,VLSI Design,3,29,30,77,72,75,30,23,53,6,18,B
4JK25EC010,Divya Kulkarni,4,Electronics and Communication (EC),EC405,Transmission Lines and Antennas,3,24,22,69,72,71,23,16,39,0,0,F`;

async function seedGrades() {
  console.log('--- 1. Creating Table: student_academic_records ---');

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_academic_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usn VARCHAR(20) NOT NULL,
      student_name VARCHAR(150) NOT NULL,
      semester INT NOT NULL,
      dept_code VARCHAR(20) DEFAULT 'EC',
      subject_code VARCHAR(20) NOT NULL,
      subject_name VARCHAR(150) NOT NULL,
      credits INT NOT NULL,
      internal_marks_1 DECIMAL(4,1),
      internal_marks_2 DECIMAL(4,1),
      attendance_1 DECIMAL(5,2),
      attendance_2 DECIMAL(5,2),
      final_attendance DECIMAL(5,2),
      cie_marks DECIMAL(4,1),
      external_marks DECIMAL(4,1),
      total_marks DECIMAL(5,1),
      grade_point INT,
      credit_point INT,
      grade_letter VARCHAR(5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_sem_sub (usn, semester, subject_code),
      INDEX idx_usn_sem (usn, semester)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ Table verified/created successfully.');

  const lines = rawCsv.trim().split('\n');
  const rows = lines.slice(1); // skip header

  console.log(`--- 2. Parsing & Inserting ${rows.length} Records ---`);

  let insertedCount = 0;
  for (const line of rows) {
    const parts = line.split(',');
    if (parts.length < 18) continue;

    const [
      usn, studentName, semStr, dept, subCode, subName, creditsStr,
      im1Str, im2Str, att1Str, att2Str, finAttStr, cieStr, extStr,
      totalStr, gpStr, cpStr, gradeLetter
    ] = parts;

    const semester = parseInt(semStr, 10);
    const credits = parseInt(creditsStr, 10);
    const im1 = parseFloat(im1Str);
    const im2 = parseFloat(im2Str);
    const att1 = parseFloat(att1Str);
    const att2 = parseFloat(att2Str);
    const finAtt = parseFloat(finAttStr);
    const cie = parseFloat(cieStr);
    const ext = parseFloat(extStr);
    const total = parseFloat(totalStr);
    const gp = parseInt(gpStr, 10);
    const cp = parseInt(cpStr, 10);

    await db.query(`
      INSERT INTO student_academic_records (
        usn, student_name, semester, dept_code, subject_code, subject_name,
        credits, internal_marks_1, internal_marks_2, attendance_1, attendance_2,
        final_attendance, cie_marks, external_marks, total_marks, grade_point,
        credit_point, grade_letter
      ) VALUES (?, ?, ?, 'EC', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        student_name = VALUES(student_name),
        subject_name = VALUES(subject_name),
        credits = VALUES(credits),
        internal_marks_1 = VALUES(internal_marks_1),
        internal_marks_2 = VALUES(internal_marks_2),
        attendance_1 = VALUES(attendance_1),
        attendance_2 = VALUES(attendance_2),
        final_attendance = VALUES(final_attendance),
        cie_marks = VALUES(cie_marks),
        external_marks = VALUES(external_marks),
        total_marks = VALUES(total_marks),
        grade_point = VALUES(grade_point),
        credit_point = VALUES(credit_point),
        grade_letter = VALUES(grade_letter)
    `, [
      usn, studentName, semester, subCode, subName,
      credits, im1, im2, att1, att2,
      finAtt, cie, ext, total, gp,
      cp, gradeLetter.trim()
    ]);

    insertedCount++;
  }

  console.log(`✅ Successfully seeded ${insertedCount} academic records into MySQL!`);
  process.exit(0);
}

seedGrades().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
