/**
 * Domain types — modelled directly on the objects the original
 * pseudo-code reads from: user, lead, lead.user, lead.course.
 */
export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  // The person who was referred (lead.user in the snippet)
  user: AppUser;
  // The course the referred user signed up for (lead.course in the snippet)
  course: Course;
  currency: string;
  referral_amount: number;
}

/**
 * The payload the referral endpoint composes — a faithful port of the
 * `context` object in the original post_to_cdn_postmark_service(...) call.
 */
export interface ReferralEmailContext {
  user_first_name: string;
  referred_user_name: string;
  course_name: string;
  currency: string;
  referral_value: number;
  referral_tracking_page_url: string;
  recipient: string;
}
