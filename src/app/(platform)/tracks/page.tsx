import { requireUser } from "@/server/auth/guards";
import { trackService } from "@/services/tracks/track-service";
import { Card, CardTitle } from "@/components/ui/card";
import { selectTrackAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function TracksPage() {
  const user = await requireUser();
  const tracks = await trackService.listTracks();
  const active = await trackService.getOrCreateActiveTrack(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">انتخاب مسیر یادگیری</h1>
        <p className="mt-1 text-muted-foreground">هر مسیر پیشرفت، درس‌ها و داشبورد مستقل دارد.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tracks.map((track) => (
          <Card key={track.id}>
            <p className="text-xs text-muted-foreground">{track.titleEn}</p>
            <CardTitle className="mt-1">{track.titleFa}</CardTitle>
            <p className="mt-3 text-sm text-muted-foreground">{track.descriptionFa}</p>
            <form action={selectTrackAction.bind(null, track.slug)} className="mt-4">
              <Button type="submit" variant={active.id === track.id ? "outline" : "default"}>
                {active.id === track.id ? "مسیر فعال · ادامه" : "انتخاب این مسیر"}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
