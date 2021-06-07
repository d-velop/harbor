// Copyright (c) 2017 VMware, Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { finalize } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../left-side-nav/user/user.service';
import { MemberService } from '../member.service';
import { UserGroup } from "../../../left-side-nav/group/group";
import { AppConfigService } from "../../../../services/app-config.service";
import { ProjectRootInterface } from "../../../../shared/services";
import { GroupType, PROJECT_ROOTS } from "../../../../shared/entities/shared.const";
import { InlineAlertComponent } from "../../../../shared/components/inline-alert/inline-alert.component";
import { errorHandler } from "../../../../shared/units/shared.utils";


@Component({
  selector: 'add-http-auth-group',
  templateUrl: './add-http-auth-group.component.html',
  styleUrls: ['./add-http-auth-group.component.scss'],
  providers: [UserService]
})

export class AddHttpAuthGroupComponent implements OnInit {
  projectRoots: ProjectRootInterface[];
  member_group: UserGroup = { group_name: '', group_type: 2 };
  role_id: number;
  addHttpAuthOpened: boolean;

  memberForm: NgForm;

  staticBackdrop: boolean = true;
  closable: boolean = false;

  @ViewChild('memberForm', {static: true})
  currentForm: NgForm;

  @ViewChild(InlineAlertComponent)
  inlineAlert: InlineAlertComponent;

  @Input() projectId: number;
  @Output() added = new EventEmitter<boolean>();

  checkOnGoing: boolean = false;

  constructor(private memberService: MemberService,
    private appConfigService: AppConfigService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.projectRoots = PROJECT_ROOTS;

    this.member_group = new UserGroup(this.appConfigService.isHttpAuthMode() ? GroupType.HTTP_TYPE : GroupType.OIDC_TYPE);
  }

  createGroupAsMember() {
    this.checkOnGoing = true;
    this.memberService.addGroupMember(this.projectId, this.member_group, this.role_id)
      .pipe(
        finalize(() => {
          this.checkOnGoing = false;
        }
        ))
      .subscribe(
        res => {
          this.role_id = null;
          this.addHttpAuthOpened = false;
          this.added.emit(true);
        },
        err => {
          let errorMessageKey: string = errorHandler(err);
          this.translateService
            .get(errorMessageKey)
            .subscribe(errorMessage => this.inlineAlert.showInlineError(errorMessage));
          this.added.emit(false);
        }
      );
  }
  onSubmit(): void {
    this.createGroupAsMember();
  }

  onCancel() {
    this.role_id = null;
    this.addHttpAuthOpened = false;
  }


  openAddMemberModal(): void {
    this.currentForm.reset();
    this.addHttpAuthOpened = true;
    this.role_id = 1;
    this.inlineAlert.close();
  }


  public get isValid(): boolean {
    return this.currentForm &&
      this.currentForm.valid &&
      !this.checkOnGoing;
  }
}
