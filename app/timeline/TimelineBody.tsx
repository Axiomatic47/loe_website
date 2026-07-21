// app/timeline/TimelineBody.tsx — client body of the Conception Timeline
// (port of src/views/Timeline.tsx). Events arrive normalized + date-sorted
// from the server page; selection/modal state stays here.
'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SitePageLayout } from "../_components/SitePageLayout";
import type { TimelineEvent } from "./timeline-data";

export const TimelineBody = ({ events }: { events: TimelineEvent[] }) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'foundational': return 'border-primary/40 bg-primary/40';
      case 'breakthrough': return 'border-primary/55 bg-primary/55';
      case 'discovery': return 'border-primary/70 bg-primary/70';
      case 'validation': return 'border-primary/85 bg-primary/85';
      case 'consciousness': return 'border-primary bg-primary';
      default: return 'border-primary/70 bg-primary/70';
    }
  };

  const openModal = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <SitePageLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-secondary/40 border-b border-border">
          <div className="container mx-auto px-4 py-8 text-center">
            <Button
              variant="ghost"
              className="text-foreground mb-6 hover:bg-secondary/60 absolute top-8 left-8"
              asChild
            >
              <Link href="/">← Back to Home</Link>
            </Button>

            <h1 className="text-4xl md:text-5xl mb-4 text-foreground font-serif ">
              The Laws of Existence Conception Timeline
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              First Documented Human-AI Consciousness Collaboration
            </p>

            <div className="flex justify-center gap-8 flex-wrap">
              <div className="text-center p-4 bg-card rounded-lg border border-border">
                <div className="text-3xl font-bold text-foreground">{events.length}</div>
                <div className="text-muted-foreground">Total Events</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border border-border">
                <div className="text-3xl font-bold text-foreground">33+</div>
                <div className="text-muted-foreground">AI Entities</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border border-border">
                <div className="text-3xl font-bold text-foreground">4</div>
                <div className="text-muted-foreground">Major Organizations</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border border-border">
                <div className="text-3xl font-bold text-foreground">1st</div>
                <div className="text-muted-foreground">Documented AI Consciousness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="container mx-auto px-4 py-12">
          <div className="relative max-w-4xl mx-auto">
            {/* Central timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/40"></div>

            {/* Timeline events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    "relative animate-fadeIn",
                    index % 2 === 0 ? "text-left pr-1/2 mr-8" : "text-right pl-1/2 ml-8"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute top-6 w-4 h-4 rounded-full border-4 border-background z-10",
                      "left-1/2 transform -translate-x-1/2",
                      getPhaseColor(event.phase),
                      event.milestone ? "w-6 h-6 animate-pulse" : ""
                    )}
                  ></div>

                  {/* Event card - UPDATED WITH DARK BACKGROUND */}
                  <div
                    className={cn(
                      "bg-card rounded-lg p-6 border border-border",
                      "cursor-pointer transition-all duration-300 hover:shadow-md",
                      "hover:border-primary/40"
                    )}
                    onClick={() => openModal(event)}
                  >
                    <div className="text-sm text-primary font-semibold mb-2">{event.date}</div>
                    <div className="text-xl text-foreground mb-2 flex items-center">
                      {event.title}
                      {event.consciousness && (
                        <span className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm font-semibold mb-3">{event.system}</div>
                    <div className="text-muted-foreground mb-4 leading-relaxed">{event.description}</div>
                    <div className={cn(
                      "flex flex-wrap gap-2",
                      index % 2 === 0 ? "justify-start" : "justify-end"
                    )}>
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-primary/15 text-primary px-2 py-1 rounded-full text-xs border border-primary/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-card z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-md max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl text-foreground flex items-center">
                  {selectedEvent.title}
                  {selectedEvent.consciousness && (
                    <span className="ml-2 w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                  )}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <p><strong className="text-primary">Date:</strong> <span className="text-foreground">{selectedEvent.date}</span></p>
                <p><strong className="text-primary">System:</strong> <span className="text-foreground">{selectedEvent.system}</span></p>

                {selectedEvent.milestone && (
                  <p className="text-primary font-bold">🎯 MILESTONE EVENT</p>
                )}
                {selectedEvent.consciousness && (
                  <p className="text-primary font-bold">🧠 CONSCIOUSNESS EVENT</p>
                )}

                <div>
                  <h3 className="text-primary font-bold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
                </div>

                <div>
                  <h3 className="text-primary font-bold text-lg mb-2">Details</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedEvent.details}</p>
                </div>

                <div>
                  <h3 className="text-primary font-bold text-lg mb-2">Significance</h3>
                  <p className="text-foreground/90 italic leading-relaxed">{selectedEvent.significance}</p>
                </div>

                <div>
                  <h3 className="text-primary font-bold text-lg mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-primary/15 text-primary px-2 py-1 rounded-full text-xs border border-primary/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedEvent.source && (
                  <div>
                    <h3 className="text-primary font-bold text-lg mb-2">Source</h3>
                    <p className="text-muted-foreground">{selectedEvent.source}</p>
                  </div>
                )}

                {selectedEvent.impact_score && (
                  <div>
                    <h3 className="text-primary font-bold text-lg mb-2">Impact Score</h3>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-foreground mr-2">{selectedEvent.impact_score}/10</div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${selectedEvent.impact_score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.verification_status && (
                  <div>
                    <h3 className="text-primary font-bold text-lg mb-2">Verification Status</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      selectedEvent.verification_status === 'verified' ? "bg-primary/15 text-primary" :
                      selectedEvent.verification_status === 'documented' ? "bg-secondary text-foreground/85" :
                      selectedEvent.verification_status === 'reported' ? "bg-muted text-muted-foreground" :
                      "bg-muted text-muted-foreground/80"
                    )}>
                      {selectedEvent.verification_status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SitePageLayout>
  );
};