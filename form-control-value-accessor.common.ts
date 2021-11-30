import {ChangeDetectorRef, Injectable, OnInit} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, FormGroup} from "@angular/forms";
import {Subscription} from "rxjs";
import {touchedChanges} from "@core/utils/reactive-form.utils";

@Injectable()
export abstract class FormControlValueAccessor implements OnInit, ControlValueAccessor {
  form: FormGroup | FormArray = new FormGroup({});
  subscriptions: Subscription[] = [];
  errorObject = {};

  protected constructor(
    readonly changeDetectorRef: ChangeDetectorRef
  ) {
  }

  get value() {
    return this.form.getRawValue();
  }

  set value(value) {
    this.form.patchValue(value);
    this.onChange(value);
    this.onTouched();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.form.valueChanges.subscribe(() => {
      this.onChange(this.form.getRawValue());
      this.onTouched();
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable()
  }

  /**
   * Required for ControlValueAccessor implementation
   */
  onChange: any = () => {
  };

  /**
   * Required for ControlValueAccessor implementation
   */
  onTouched: any = () => {
  };

  /**
   * Required for ControlValueAccessor implementation
   * @param fn
   */
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  /**
   * Required for ControlValueAccessor implementation
   * @param value
   */
  writeValue(value: any) {
    if (value) {
      this.value = value;
    } else if (value === null) {
      this.form.reset();
    }
  }

  /**
   * Required for ControlValueAccessor implementation
   * @param fn
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Required for ControlValueAccessor implementation
   * @param _
   */
  validate(_: FormControl) {
    if (_.touched) {
      this.form.markAllAsTouched()
      this.changeDetectorRef.detectChanges();
    }

    this.subscriptions.push(
      touchedChanges(_).subscribe((touched) => {
          touched ? this.form.markAllAsTouched() : this.form.markAsUntouched()
          this.changeDetectorRef.detectChanges();
        }
      )
    )

    return this.form.valid ? null : this.errorObject
  };

  /**
   * Disable in the current from according to original fields must be disabled
   * @param isDisabled
   * @param form
   */
  disabledFields(isDisabled: boolean, form: FormGroup) {
    if (!isDisabled) {
      Object.keys(form.controls).forEach((key) => {
        if (form.get(key)?.disabled) {
          this.form.get(key)?.disable()
        }
      })
    }
  }
}
