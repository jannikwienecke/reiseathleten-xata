// export class PostMap implements Mapper<Post> {

import { VacationEntity } from "../domain/vacation";
import { LocationEntity } from "../domain/location";
import { TagValueObject } from "../domain/tag";
import { ActivityEntity } from "../domain/activity";
import { DateValueObject } from "../domain/date";
import { ActivityNameValueObject } from "../domain/activity-name";
import { ActivityDescriptionValueObject } from "../domain/activity-description";
import { VacationDtoProps } from "../dto/vacation-dto";

//     public static toDomain (raw: any): Post {
//       const postType: PostType = raw.type;

//       const postOrError = Post.create({
//         memberId: MemberId.create(new UniqueEntityID(raw.member_id)).getValue(),
//         slug: PostSlug.createFromExisting(raw.slug).getValue(),
//         title: PostTitle.create({ value: raw.title }).getValue(),
//         type: postType,
//         text: postType === 'text' ? PostText.create({ value: raw.text }).getValue() : null,
//         link: postType === 'link' ? PostLink.create({ url: raw.link }).getValue() : null,
//         points: raw.points,
//         totalNumComments: raw.total_num_comments
//       }, new UniqueEntityID(raw.post_id))

//       postOrError.isFailure ? console.log(postOrError.getErrorValue()) : '';

//       return postOrError.isSuccess ? postOrError.getValue() : null;
//     }

//     public static toPersistence (post: Post): any {
//       return {
//         total_num_comments: post.totalNumComments,
//         updatedAt: new Date().toString(),
//         title: post.title.value,
//         post_id: post.postId.getStringValue(),
//         member_id: post.memberId.getStringValue(),
//         text: post.isTextPost() ? post.text.value : null,
//         slug: post.slug.value,
//         points: post.points,
//         type: post.type,
//         link: post.isLinkPost() ? post.link.url : null,
//       }
//     }
//   }

export class VacationMap {
  public static toDomain({
    location,
    activities,
    tags,
    vacation,
  }: VacationDtoProps): VacationEntity {
    if (!location) throw new Error("location not found");

    const _location = LocationEntity.create({
      name: location.name || "",
      description: location.description || "",
    });

    const _tags = tags.map((t) =>
      TagValueObject.create({
        label: t.label || "",
        color: t.color || "",
      })
    );

    const _activities = activities.map((a) =>
      ActivityEntity.create({
        id: a.id || "",
        datetime: DateValueObject.create({
          value: a.datetime?.toString() || undefined,
        }),
        isFixedDate: a.isFixedDate || false,
        name: ActivityNameValueObject.create({ value: a.name || "" }),
        description: ActivityDescriptionValueObject.create({
          value: a.description || "",
        }),
        tags: _tags,
      })
    );

    return VacationEntity.create({
      id: vacation.id || "",
      startDate: DateValueObject.create({
        value: vacation.startDate.toString(),
      }),
      endDate: DateValueObject.create({ value: vacation.endDate.toString() }),
      location: _location,
      activities: _activities,
    });
  }
}
