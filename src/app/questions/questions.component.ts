import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Pipe,
  PipeTransform,
} from '@angular/core';
import * as Global from '../shared/global';
import { ApiService } from '../shared/api.service';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';

// @Pipe({
//   name: 'safeHtml'
// })
// export class SafeHtmlPipe implements PipeTransform {
//     constructor(private domSanitizer: DomSanitizer) { }
//     transform(html) {
//     return this.domSanitizer.bypassSecurityTrustHtml(html);
//     }
// }
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
})
export class QuestionsComponent implements OnInit {
  // @ViewChild('#content') myModal: any;
  @ViewChild('showModalButton', { static: false }) showModalButton: ElementRef;
 //  @ViewChild('qType', { static: false }) qType: ElementRef;
  // @ViewChild('qCircle', { static: false }) qCircle: ElementRef;
  creating = false; // false editing
  $emoji = String.fromCodePoint(Global.position2unicode(22));

  // questionForm = new FormGroup();
  questions = Global.questionsData;
  questionCircles = Global.circlesData;
  questionCircle: Global.CirclesJson;
  // questionTypes =  ['single', 'multiple', 'calculated'];
  // QuestionTypes = Global.questionType;
  // questionTypes = this.QuestionTypes.GetValues(Global.questionType);
  // .GetValues
  questionTypes = Object.values(Global.questionType).slice( // Convert Enums to Arrays
    0,
    Object.values(Global.questionType).length / 2
  );
  // QuestionCircles = Global.questionsData;
  // questionTypes = Global.enumToArray(Global.questionType);
  // questionTypes =  Object.keys(Global.questionType).map(key => Global.questionType[key]);
  theQuestion: Global.QuestionJson = {
    id: 0,
    type: Global.questionType.single,
    circle: Global.circlesData[0],
    details: 'What will the temperture in Cape Town be @ 2PM?',
    active: false,
    creator: 0,
    checker: 0,
    answer1: '',
    answer2: '',
    answer3: '',
    answer4: '',
    answer5: '',
    answer6: '',
    number_times_used: 0,
    last_used: false,
  };
  questionForm: FormGroup;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.questionForm = fb.group(this.theQuestion);
  }

  ngOnInit(): void {
    this.apiService.doGetQuestions().subscribe((result) => {
      //
      this.questions = result;
      // this.questions.;
      Global.setQuestionsData(result);
      console.log(' result ');
      console.log(result);
      console.log(result[0]);
      console.log(result[0].circle);
      // jQuery(() => {
      //   jQuery('[data-toggle="tooltip"]').tooltip();
      // });
    });
  }

  // ngAfterViewInit() {
  //   this.showModalButton.nativeElement.style.background = 'green';
  // }

  newQuestion() {
    console.log('New Question button clicked ');
  }
  selectedType(theType: Global.questionType) {
    this.theQuestion.type = theType;
    console.log(' theType ' + theType );
    console.dir(theType);
   // this.theQuestion.answer1 = "";
  // alert(' HEEER #' + this.theQuestion.type + '#' + Global.questionType.poll.valueOf+ '#' );
    if ( String(this.theQuestion.type) === 'poll') {
     // alert(' HEEER ' + theType);
      this.theQuestion.answer1 = 'Strong Agree';
      this.theQuestion.answer2 = 'Agree';
      this.theQuestion.answer3 = 'Neutral';
      this.theQuestion.answer4 = 'Disagree';
      this.theQuestion.answer5 = 'Strongly Disagree';
      this.questionForm.setValue(this.theQuestion);
    }
    // alert(' theType ' + theType);
  }

  selectedCircle(theCircle: Global.CirclesJson) {
    this.theQuestion = this.questionForm.value;
    // this.theQuestion.circle = theCircle;
    console.log(' theCircle ' + theCircle );
    console.dir(theCircle);
    console.dir(this.theQuestion);
  }

  submitQuestion() {
    console.log(' submitted Question ' + this.creating);
    this.theQuestion = this.questionForm.value;
    this.theQuestion.checker = 100; // TODO
    console.log(this.theQuestion.circle);
    // if (this.theQuestion.circle === "") {

    // }
    // this.theQuestion.creator = Global.loginUser.userId;
    this.apiService.createOrEditQuestion(this.theQuestion, this.creating).subscribe((result) => {
      console.log(result);
      this.showModalButton.nativeElement.click();
    });
  }

  available(questionId: number) {
    console.log(' Make available ' + questionId);
    let found = -1;
    this.questions.forEach((element) => {
      if (element.id === questionId) {
        this.theQuestion = element;
        found = element.id;
      }
    });
    if (found > 0) {
      console.log(this.theQuestion);
      console.log(this.theQuestion.circle);

      const check = prompt(`Are you sure you want to this questions to everyone in the ${this.theQuestion.circle.name} Circle? `);
      if (check === this.theQuestion.circle.name) {
        // this.theQuestion.creator = Global.loginUser.userId;

        this.apiService.makeAvailable(questionId, this.theQuestion.circle.id).subscribe((result) => {
          alert (` Result ${result.value}`);
          console.log('result #' + result + '#');
        });
      } else {
        console.log('cancelled');
        alert (` Cancelled `);
      }
    } else {
      alert (` invalid ${questionId} `);
    }
  }

  create() {
    this.creating = true;
    this.questionForm = this.fb.group(this.theQuestion);
    // this.qType.nativeElement.value = this.theQuestion.type;
    // // this.qCircle.nativeElement.value = this.theQuestion.circle.name;
    // // // this.qCircle.nativeElement = this.theQuestion.circle;
    console.log(' create ');
    this.showModalButton.nativeElement.click();
    console.log(' pos ' + Global.position2unicode(22));
    console.log(' str ' + String.fromCodePoint(Global.position2unicode(22)));
  }

  edit(questionId: number) {
    let found = -1;
    this.creating = false;
    this.questions.forEach((element) => {
      if (element.id === questionId) {
        this.theQuestion = element;
        found = element.id;
        console.log(' this.theQuestion ' + this.theQuestion + ' ');
        console.dir(this.theQuestion);
        console.log(' this.theQuestion.circle ' + this.theQuestion.circle + ' ');
        console.dir(this.theQuestion.circle);
      }
    });
    if (found > 0) {
      this.creating = false;
      this.questionForm = this.fb.group(this.theQuestion);
      this.questionForm
        .get('creator')
        .setValidators([Validators.min(18), Validators.max(65)]);
      this.questionForm
        .get('checker')
        .disable({ onlySelf: true, emitEvent: true });
      this.questionForm.get('creator').updateValueAndValidity();
      this.questionForm.get('checker').updateValueAndValidity();
      // this.qType.nativeElement.value = this.theQuestion.type;
      // // this.qCircle.nativeElement.value = this.theQuestion.circle.name;
      // // // this.qCircle.nativeElement.value = 'Sport';
      console.log(' this.theQuestion.circle ' + this.theQuestion.circle + ' ');
      console.log(this.theQuestion.circle.name);
      // console.log(this.qCircle.nativeElement.value);
      this.showModalButton.nativeElement.click();
    } else {
      alert (` invalid ${questionId} `);
    }
  }

  remove(questionId: number) {
    // DataBase user doesn't have rights to remove
    let found = -1;
    this.questions.forEach((element) => {
      if (element.id === questionId) {
        this.theQuestion = element;
        found = element.id;
      }
    });
    if (found > 0) {
      this.questionForm = this.fb.group(this.theQuestion);
      if (
        confirm(
          'Are you sure you want to remove element with Question Id' +
            questionId
        )
      ) {
        this.apiService.removeQuestion(questionId).subscribe((result) => {
          console.log('result #' + result + '#');
        });
      }
    }
  }

  /**
   * https://stackoverflow.com/a/41504893/344050
   *
   */
  customTrackBy(index: number, obj: any): any {
    // return index;
    return obj.id;
  }
}
