import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'topicSearch' })
export class TopicSearchPipe implements PipeTransform {
    transform(topics: any[], searchTerm: string): any[] {
        if (!topics || !searchTerm) return topics;
        return topics.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
}
