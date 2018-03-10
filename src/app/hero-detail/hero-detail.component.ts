// tslint:disable-next-line:import-spacing
import { Component, Input, OnChanges }             from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators  } from '@angular/forms';

import {  Address, Hero, states } from '../data-model';
// tslint:disable-next-line:import-spacing
import { HeroService }           from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})

export class HeroDetailComponent implements OnChanges {
  heroForm: FormGroup; // <--- heroForm is of type FormGroup
  states = states;

  @Input() hero: Hero;

  constructor(
    private fb: FormBuilder,
    private heroService: HeroService) { // <--- inject FormBuilder
    this.createForm();
    this.logNameChange();
  }

  createForm() {
    this.heroForm = this.fb.group({
      name: ['', Validators.required ], // <--- the FormControl called "name"
      secretLairs: this.fb.array([]),
      power: '',
      sidekick: ''
    });
  }
  ngOnChanges() {
      this.rebuildForm();
    }
  rebuildForm() {
      this.heroForm.reset({
        name: this.hero.name
      });
      this.setAddresses(this.hero.addresses);
    }

  setAddresses(addresses: Address[]) {
      const addressFGs = addresses.map(address => this.fb.group(address));
      const addressFormArray = this.fb.array(addressFGs);
      this.heroForm.setControl('secretLairs', addressFormArray);
    }

    get secretLairs(): FormArray {
      return this.heroForm.get('secretLairs') as FormArray;
    }

    addLair() {
      this.secretLairs.push(this.fb.group(new Address()));
    }

    // tslint:disable-next-line:member-ordering
  nameChangeLog: string[] = [];
  logNameChange() {
      const nameControl = this.heroForm.get('name');
      nameControl.valueChanges.forEach(
       (value: string) => this.nameChangeLog.push(value)
      );
  }
  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.rebuildForm();
  }
  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    const saveHero: Hero = {
      id: this.hero.id,
      name: formModel.name as string,
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };
    return saveHero;
  }
  revert() { this.rebuildForm(); }
}
