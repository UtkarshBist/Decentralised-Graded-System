/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Marks the grade of an exam
 @param {org.acme.model.mark_grade_professor}mark_grade_professor - the grade to be processed 
 @transaction
 */ 

async function mark_grade_professor(pro) 
{
  if(pro.student.state === 'FINALISED')
  {
    throw new Error('MARKS HAS BEEN SUBMITTED');
  }
  else
  {
    if (pro.grade.student !== pro.student)
    {
      throw new Error('IDs not matched');
    }
    else
    {
      if (pro.grade_new < 4.00)
      {
        if(pro.grade_new < 0)
        {
          throw new Error("CGPA cannot be negative");
        }
        pro.professor.test = 'OK';
        pro.student.state = 'VALID';
        pro.grade.state = 'VALID';
        pro.grade.grade_num = 0;
        pro.student.last_grade = 0;
        pro.student.status = 'FAIL';
        pro.student.grades.push(pro.grade_new);
      }
      else
      {
        if(pro.grade_new > 10)
        {
          throw new Error("CGPA cannot be more than 10.00");
        }
        pro.professor.test = 'OK';
        pro.student.state = 'VALID';
        pro.grade.state = 'VALID';
        pro.grade.grade_num = pro.grade_new;
        pro.student.last_grade = pro.grade_new;
        pro.student.status = 'PASS';
        pro.student.grades.push(pro.grade_new);
      }
    
      const ar = await getParticipantRegistry('org.acme.model.Student');
      await ar.update(pro.student);
  
      const dr = await getAssetRegistry('org.acme.model.Grade');
      await dr.update(pro.grade);
    }
  }
} 
  

/**
 * Marks the grade of an exam
 @param {org.acme.model.mark_grade_student}mark_grade_student - the grade to be processed 
 @transaction
 */ 

async function mark_grade_student(stu) 
{
  if(stu.student.state === 'FINALISED')
  {
    throw new Error('MARKS HAS BEEN SUBMITTED');
  }
  else
  {
    if (stu.grade.student !== stu.student)
    {
      throw new Error('IDs not matched');
    }
    else
    {
      if(stu.grade_new < 4.00)
      {
       stu.student_id.test ='OKAY'; 
       stu.student.state = 'PROCESSING';
       stu.grade.state = 'PROCESSING';
       stu.grade.grade_num = 0;
       stu.student.last_grade = 0;
       stu.student.status = 'FAIL';
       stu.student.grades.push(stu.grade_new); 
      }
      else
      {
      stu.student_id.test ='OKAY'; 
      stu.student.state = 'PROCESSING';
      stu.grade.state = 'PROCESSING';
      stu.grade.grade_num = stu.grade_new;
      stu.student.last_grade = stu.grade_new;
      stu.student.status = 'PASS';
      stu.student.grades.push(stu.grade_new);
      }
      const ar = await getParticipantRegistry('org.acme.model.Student');
      await ar.update(stu.student);
  
      const dr = await getAssetRegistry('org.acme.model.Grade');
      await dr.update(stu.grade);
    }
  }
} 

/**
 * Marks the grade of an exam
 @param {org.acme.model.change}change - the grade to be processed 
 @transaction
 */ 

async function change(ch) 
{
  if (ch.grade.student !== ch.student)
  {
    throw new Error('IDs not matched');
  }
  else
  {
    if(ch.student.state === 'FINALISED')
    {
      throw Error("THE STATE IS FINALISED. CANNOT CHANGE ANYTHING NOW.");
    }
    else
    {
      if(ch.state === 'INVALID')
      {
        if(ch.student.state === 'INVALID')
        {
          throw Error("THE STATE IS ALREADY IN INVALID STATE.");
        }
        else
        {
          ch.student.last_grade = ' ';
          ch.grade.grade_num = ' ';
          ch.student.status ='NIL';
        }
      }
      else if(ch.state === 'FINALISED')
      {
        if(ch.student.state === 'INVALID')
        {
          throw Error("First VALID the marks");
        }
      else if(ch.student.state === 'PROCESSING')
      {
        throw Error("First VALID the marks");
      }
      else
      {
        ch.student.state = 'FINALISED';
        ch.grade.state = 'FINALISED';
      }
    }
    else if (ch.state === 'VALID')
    {
      if(ch.student.state === 'VALID')
      {
        throw Error("THE STATE IS ALREADY IN VALID STATE");
      }
      else
      {
        ch.student.state = 'VALID';
        ch.grade.state = 'VALID';
      }
    }
  }
  const ar = await getParticipantRegistry('org.acme.model.Student');
  await ar.update(ch.student);
  
  const dr = await getAssetRegistry('org.acme.model.Grade');
  await dr.update(ch.grade);
  }                                                    
}

